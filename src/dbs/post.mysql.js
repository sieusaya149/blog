const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { v4: uuidv4 } = require('uuid');

const SqlBuilder = require('../utils/sqlBuilder')

class PostSummarizeContent {
  constructor(postData, index) {
    const {
      postId,
      title,
      summarize,
      created_at,
      updated_at,
      userId,
      userName,
      avatarUrl,
      thumbnailUrl
    } = postData;
    this.index = index
    this.postId = postId;
    this.title = title;
    this.summarize = summarize;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.userId = userId;
    this.userName = userName;
    this.avatarUrl = avatarUrl;
    this.thumbnailUrl = thumbnailUrl;
  }

  getSantilizedPostData() {
    const { userId, userName, avatarUrl } = this;
    const {
      postId,
      title,
      summarize,
      thumbnailUrl,
      created_at,
      updated_at
    } = this;

    return {
      index: this.index,
      author: {
        userId,
        userName,
        avatar: avatarUrl
      },
      postData: {
        postId,
        title,
        summarize,
        thumbnail: thumbnailUrl,
        created_at,
        updated_at
      }
    };
  }
}
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

    async getPostByUserId(userId, numberPosts)
    {
      try {
        const getPost = "SELECT\
                          p.postId,\
                          p.title,\
                          p.summarize,\
                          p.created_at,\
                          p.updated_at,\
                          u.userId, \
                          u.userName,\
                          a.imageUrl AS avatarUrl,\
                          t.imageUrl AS thumbnailUrl\
                        FROM\
                            post p\
                        JOIN\
                            user u ON p.userId = u.userId\
                        LEFT JOIN\
                            image a ON u.userId = a.userId AND a.topic = 'avatar'\
                        LEFT JOIN\
                            image t ON p.postId = t.postId AND t.topic = 'thumnail'\
                        WHERE\
                            p.userId = ?\
                        ORDER BY\
                        p.created_at DESC;";
        const postData = await this.dbInstance.executeQueryV2(getPost, [userId]);
        if(postData.length == numberPosts)
        {
          let postSummarizeContents = []
          let index = 0
          postData.forEach(element => {
              let postSummarize = new PostSummarizeContent(element, index)
              postSummarizeContents.push(postSummarize.getSantilizedPostData())
              index = index + 1
          });
          return postSummarizeContents
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

    async getNumberPostOfUser(userId)
    {
      try {
        const numsPostQuery = 'SELECT COUNT(*) FROM POST WHERE userId = ?';
        const result = await this.dbInstance.executeQueryV2(numsPostQuery, [userId]);
        return result[0]['COUNT(*)']
      }
      catch (error) {
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