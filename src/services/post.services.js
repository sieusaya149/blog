const instanceMySqlDB = require('../dbs/init.mysql')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const path = require('path');
const PostData = require('../dbs/post.mysql')
const HEADER = {
    CLIENT_ID: 'x-client-id' 
}
const BODY = {
    POST_TITLE: 'post-title',
    POST_STATUS: 'post-status',
    POST_PERMIT: 'post-permit',
    POST_CATEGORY: 'post-category',
    POST_CONTENT: 'post-content',
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
    static updatePost = async (req) =>{
        const userId = req.headers[HEADER.CLIENT_ID];
        const postTitle = req.body[BODY.POST_TITLE];
        const postStatus = req.body[BODY.POST_STATUS]
        const postPermit = req.body[BODY.POST_PERMIT];
        const postContent = req.body[BODY.POST_CONTENT];
        const postCategory = req.body[BODY.POST_CATEGORY]
        if( !userId || 
            !postTitle ||
            !postStatus ||
            !postPermit ||
            !postContent ||
            !postCategory)
        {
            throw new AuthFailureError("Not Enough Headers")
        }

        const summarize = getFirst100Words(postContent)
        // check if status valid
        // check if permit valid
        // check if categoryId exist
        const categoryData = await instanceMySqlDB.getCategory(postCategory)
        if(categoryData == null)
        {
            throw new AuthFailureError("Category name Invalid")
        }
        const postIdNew = await PostData.insertPostToDb(postTitle, postStatus, postPermit, summarize, postContent, userId, categoryData.categroryId)
        if(postIdNew == null)
        {
            throw new AuthFailureError("Can Not Create New Post")
        }
        return {
            code: 200,
            metadata:{
                newPostId: postIdNew
            }
        }   
    }

    static getPost = async (req) =>{
       //1. check post existed in db or not
       //2. get post data
       //3. get author data
       //4. return author data + post data to client
       const postId = req.params.postId
       console.log('postid is ',postId)
       const postData = await PostData.getPostByPostId(postId)
       console.log(postData)
       if(postData == null)
       {
           throw new BadRequestError("No Post Id")
       }
       return {
           status: 200,
           metadata: {
               postData: postData
           }
       }
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
       const postData = await PostData.getPostByUserId(req.headers[HEADER.CLIENT_ID])
       return {
        status: 200,
        metadata: {
            postsData: postData
        }
    }
    }
    
}

module.exports = PostService