const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { v4: uuidv4 } = require('uuid');

const SqlBuilder = require('../utils/sqlBuilder')
class PostQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
    async insertPostToDb(title, statusEdit, sharePermit, summarize, content,
                         userId, categoryId)
    {
      try {
        const postId = uuidv4();
        const query = 'INSERT INTO POST (postId, title, statusEdit, sharePermission , summarize,\
                       content, userId) \
                       VALUES (?, ?, ?, ?, ?, ?, ?)';
        await this.dbInstance.executeQueryV2(query, [postId, title, statusEdit, sharePermit,
                                                     summarize, content, userId]);
        await this.updatePostCategoryTable(postId, categoryId)
        return postId;
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    async updatePostCategoryTable(postId, categroryId)
    {
      const checkQuery = "SELECT COUNT(*) as count from POSTCATEGORY WHERE postId = ? AND categroryId = ?"
      const result = await this.dbInstance.executeQueryV2(checkQuery, [postId, categroryId]);
      if(result[0].count > 0)
      {
        console.log("Do not need update categrory")
      }
      else
      {
        const updatePostCategory = 'INSERT INTO POSTCATEGORY (postId, categroryId) VALUES (?, ?)';
        await this.dbInstance.executeQueryV2(updatePostCategory, [postId, categroryId]);
      }
    }

    async updatePost(queriesData, postId, categroryId)
    {
      const {query, queryParams} = SqlBuilder.dynamicSqlForUpdatePostByPostId(queriesData, postId)
      await this.dbInstance.executeQueryV2(query, queryParams);
      await this.updatePostCategoryTable(postId, categroryId)
    }

    async deletePost(postId)
    {
      const query = 'DELETE FROM POST WHERE postId = ?'
      const result = await this.dbInstance.executeQueryV2(query, [postId]);
    }


    async getPostByPostId(postId)
    {
      try {
        const getPost = 'SELECT * FROM POST WHERE postId = ?';
        const postData = await this.dbInstance.executeQueryV2(getPost, [postId]);
        if(postData.length == 1)
        {
          return postData[0]
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    async getPostByUserId(userId)
    {
      try {
        const getPost = 'SELECT * FROM POST WHERE userId = ?';
        const postData = await this.dbInstance.executeQueryV2(getPost, [userId]);
        if(postData.length >= 1)
        {
          console.log(`nums post is ${postData.length}`)
          return postData
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    // FIXME I think getCategory should not is the method of the class
    async getCategory(categroryName)
    {
      try {
        const query = 'SELECT * FROM CATEGORY WHERE categroryName = ? ';
        const result =await this.dbInstance.executeQueryV2(query, [categroryName]);
        return result.length > 0? result[0]: null;
      }
      catch (error) {
        return null
      }
    }

    async updatePostStatus(status, postId)
    {
      const query = "UPDATE POST set statusEdit = ? where postId = ?"
      const result = await this.dbInstance.executeQueryV2(query, [status, postId])
      if(result.affectedRows == 0)
      {
        throw new Error("No PostId was updated to unpublish")
      }
    }

    async upSertCommentForPost(commentText, postId, userId, parentCommentId, commendId)
    {
      if(commendId)
      {
        const query = "UPDATE COMMENT set commentText = ?, postId = ?, userId = ?, parentCommentId=? where commentId = ?"
        const result = await this.dbInstance.executeQueryV2(query, [commentText, postId, userId, parentCommentId, commendId])
        if(result.affectedRows == 0)
        {
          throw new Error("No Comment was updated")
        }
      }
      else
      {
        const query = "INSERT INTO COMMENT  (commentId, commentText, postId, userId, parentCommentId) \
                       VALUES(UUID(), ?, ?, ?, ?)"
        const result = await this.dbInstance.executeQueryV2(query, [commentText, postId, userId, parentCommentId])
        if(result.affectedRows != 1)
        {
          throw new Error("Can not insert new comment")
        }
      }
      
    }

    async upSertLikeForPost(postId, userId)
    {
      const checkQuery = "SELECT * from LIKE_EMOTION WHERE postId = ? AND userId = ?"
      var result = await this.dbInstance.executeQueryV2(checkQuery, [postId, userId]);
      if(result.length == 1)
      {
        console.log(`Dislike Post ${postId}`)
        const deleteLikeQuery = "DELETE FROM LIKE_EMOTION WHERE likeId = ?"
        result = await this.dbInstance.executeQueryV2(deleteLikeQuery, [result[0].likeId]);
        if(result.affectedRows != 1)
        {
          throw new Error("Can not DisLike Post")
        }
      }
      else
      {
        console.log(`Like Post ${postId}`)
        const updateLike = 'INSERT INTO LIKE_EMOTION (likeId, postId, userId) VALUES (UUID(), ?, ?)';
        result = await this.dbInstance.executeQueryV2(updateLike, [postId, userId]);
        if(result.affectedRows != 1)
        {
          throw new Error("Can not Like Post")
        }
      }
    }

   // FIXME I think getCommentById should not is the method of the class
    async getCommentById(commentId)
    {
      try {
        const getCommentSql = 'SELECT commentId, commentText, userId FROM COMMENT WHERE commentId = ?';
        const commentData = await this.dbInstance.executeQueryV2(getCommentSql, [commentId]);
        if(commentData.length == 1)
        {
          return commentData[0]
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    async getCommentByParentId(parentCommentId)
    {
      try {
        const getCommentSql = 'SELECT commentId, commentText, userId, updated_at, created_at FROM COMMENT \
                               WHERE parentCommentId = ? \
                               ORDER BY created_at DESC';
        const commentData = await this.dbInstance.executeQueryV2(getCommentSql, [parentCommentId]);
        if(commentData.length > 0)
        {
          return commentData
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    async getCommentByPostId(postId, hiddenSubComment = true)
    {
      try {
        const appendQuery = hiddenSubComment? " AND parentCommentId is NULL ": ""
        const getCommentSql = `SELECT commentId, commentText, userId, updated_at, created_at FROM COMMENT \
                               WHERE postId = ? ${appendQuery}\
                               ORDER BY created_at DESC`;
        const commentData = await this.dbInstance.executeQueryV2(getCommentSql, [postId]);
        console.log(commentData)
        if(commentData.length > 0)
        {
          return commentData
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    // FIXME I think deleteComment should not is the method of the class
    async deleteComment(commentId, userId)
    {
      try {
        const deleteCommentSql = 'DELETE FROM COMMENT WHERE commentId = ?  and userId = ?';
        const commentData = await this.dbInstance.executeQueryV2(deleteCommentSql, [commentId, userId]);
        console.log(commentData)
        if(commentData.affectedRows == 1)
        {
          return commentData
        }
        else
        {
          return null
        }
      }
      catch (error) {
        console.log(error)
        return null
      }
    }
}

module.exports = new PostQuery()