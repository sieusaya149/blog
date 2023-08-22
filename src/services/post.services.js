const instanceMySqlDB = require('../dbs/init.mysql')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const path = require('path');
const PostQuery = require('../dbs/post.mysql')
const { get } = require('../routers');
const { query } = require('express');
const POST_BODY = {
    POST_TITLE: 'postTitle',
    POST_STATUS: 'postStatus',
    POST_PERMIT: 'postPermit',
    POST_CATEGORY: 'postCategory',
    POST_CONTENT: 'postContent',
}
function getFirst100Words(text) {
    // Split the text into an array of words
    const words = text.split(' ');
  
    // Get the first 100 words or the entire text if it has less than 100 words
    const first100Words = words.slice(0, 100).join(' ');
  
    return first100Words;
  }

class PostService
{
    static async updatePostStatus(newStatusEdit, postId)
    {
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postExist = await PostQuery.getPostByPostId(postId)
        if(postExist == null || postExist.statusEdit === newStatusEdit)
        {
            throw new BadRequestError("Post did not exist or has been matched status")
        }
        // update post-status
        try {
            await PostQuery.updatePostStatus(newStatusEdit,postId)
        } catch (error) {
            throw new BadRequestError(error)
        }
    }
    static publishPost = async (req) =>{
        const userId = req.cookies.userId;
        const postTitle = req.body[POST_BODY.POST_TITLE];
        const postStatus = req.body[POST_BODY.POST_STATUS];// should skip because when publish it always is publish
        const postPermit = req.body[POST_BODY.POST_PERMIT];
        const postContent = req.body[POST_BODY.POST_CONTENT];
        const postCategory = req.body[POST_BODY.POST_CATEGORY]
        if( !userId || 
            !postTitle ||
            !postStatus ||
            !postPermit ||
            !postContent ||
            !postCategory)
        {
            throw new BadRequestError("Not Enough Headers")
        }

        if( postStatus !== 'publish')
        {
            throw new BadRequestError("Post status should be Publish")
        }

        const summarize = getFirst100Words(postContent)
        // check if status valid
        // check if permit valid
        // check if categoryId exist
        const categoryData = await PostQuery.getCategory(postCategory)
        if(categoryData == null)
        {
            throw new BadRequestError("Category name is invalid")
        }
        const postIdNew = await PostQuery.insertPostToDb(postTitle, postStatus, postPermit, summarize, postContent, userId, categoryData.categroryId)
        if(postIdNew == null)
        {
            throw new BadRequestError("Can Not Create New Post")
        }
        return {newPostId: postIdNew}
    }

    static rePublishPost = async (req) => {
        const newStatusEdit = 'publish'
        const postId = req.params.postId
        await PostService.updatePostStatus(newStatusEdit, postId)
        return {metaData: `update post ${postId} to ${newStatusEdit} mode`}
    }
    
    static unpublishPost = async(req) => {
        const newStatusEdit = 'unpublish'
        const postId = req.params.postId
        await PostService.updatePostStatus(newStatusEdit, postId)
        return {metaData: `update post ${postId} to ${newStatusEdit} mode`}
    }

    static readSinglePost = async (req) =>{
       //1. check post existed in db or not
       //2. get post data
       //3. get author data
       //4. return author data + post data to client
       const postId = req.params.postId
       if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
       const postData = await PostQuery.getPostByPostId(postId)
       if(postData == null)
       {
           throw new BadRequestError("No Post Id")
       }
       return {metaData: postData}
    }

    static editPost = async(req) => {
        const postId = req.params.postId
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        const {title, statusEdit, sharePermission, categroryName} = req.query
        const {postContent} = req.body
        var categroryId = null
        if(categroryName)
        {
            const existingCategory = await PostQuery.getCategory(categroryName)
            if(existingCategory == null)
            {
                throw new BadRequestError("The category does not exist")
            }
            else
            {
                categroryId = existingCategory.categroryId
            }
        }
        var summarize = null
        if(postContent)
        {
            summarize=getFirst100Words(postContent)
        }
        const queriesData = {
            title: title,
            statusEdit: statusEdit,
            sharePermission: sharePermission,
            summarize: summarize,
            content: postContent
        }
        try {
            await PostQuery.updatePost(queriesData, postId, categroryId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static deletePost = async (req) => {
        const postId = req.params.postId
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.deletePost(postId)
        } catch (error) {
            throw new BadRequestError("Can not delete Post")
        }
        return {metaData: `Delete Post ${postId} Success`}
    }

    static commentPost = async(req) => {
        const postId = req.params.postId;
        // commentId and parent comment Id might be null
        const commentId = req.body.commentId;
        const parentCommentId = req.body.parentCommentId;
        const comment = req.body.comment
        const userId = req.cookies.userId
        if(!postId || !comment || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }

        if(parentCommentId)
        {
            const parentData = await PostQuery.getCommentById(parentCommentId)
            if(parentData == null)
            {
                throw new BadRequestError(`parent comment with id ${parentCommentId} did not exist`)
            }
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.upSertCommentForPost(comment, postId, userId, parentCommentId, commentId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static deleteComment = async(req) => {
        const commentId = req.params.commentId;
        const userId = req.cookies.userId;
        console.log(commentId)
        if(!commentId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const commentData = await PostQuery.getCommentById(commentId, userId)
        if(commentData == null)
        {
            throw new BadRequestError(`comment with id ${commentId} did not exist`)
        }
        try {
            const commentDeleted= await PostQuery.deleteComment(commentId, userId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static getComment = async (req) => {
        const postId = req.params.postId;
        const userId = req.cookies.userId;
        const parentCommentId = req.query.parentCommentId
        if(!postId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        if(parentCommentId)
        {
            return await PostQuery.getCommentByParentId(parentCommentId)
        }
        else
        {
            return await PostQuery.getCommentByPostId(postId)
        }
    }

    static getAllComment = async (req) => {
        const postId = req.params.postId;
        const userId = req.cookies.userId;
        if(!postId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const listComment = await PostQuery.getCommentByPostId(postId, false)

    }

    static likePost = async(req) => {
        const postId = req.params.postId
        const userId = req.cookies.userId
        console.log(userId)
        if(!userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.upSertLikeForPost(postId, userId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static getAllPost = async (req) =>{
       //1. get all post existed (user id == header)
       //2. get post data
       //3. get author data
       //4. return author data + post data to client
       const userId = req.headers[HEADER.CLIENT_ID];
       if( !userId)
        {
            throw new AuthFailureError("Not Enough Headers")
        }
       const PostQuery = await PostQuery.getPostByUserId(req.headers[HEADER.CLIENT_ID])
       return {
        status: 200,
        metadata: {
            postsData: PostQuery
        }
    }
    }
    
}

module.exports = PostService