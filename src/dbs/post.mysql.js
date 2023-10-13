const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { v4: uuidv4 } = require('uuid');

const SqlBuilder = require('../utils/sqlBuilder');
const QueryBase = require('./queryBase');

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
class PostQuery extends QueryBase{
    constructor()
    {
        super()
    }
    async insertPostToDb(title, statusEdit, sharePermit, summarize, content,
                         userId, categoryId)
    {
      try {
        const postId = uuidv4();
        const query = 'INSERT INTO POST (postId, title, statusEdit, sharePermission , summarize,\
                       content, userId) \
                       VALUES (?, ?, ?, ?, ?, ?, ?)';
        await this.dbInstance.hitQuery(query, [postId, title, statusEdit, sharePermit,
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
      const result = await this.dbInstance.hitQuery(checkQuery, [postId, categroryId]);
      if(result[0].count > 0)
      {
        console.log("Do not need update categrory")
      }
      else
      {
        const updatePostCategory = 'INSERT INTO POSTCATEGORY (postId, categroryId) VALUES (?, ?)';
        await this.dbInstance.hitQuery(updatePostCategory, [postId, categroryId]);
      }
    }

    async updatePost(queriesData, postId, categroryId)
    {
      const {query, queryParams} = SqlBuilder.dynamicSqlForUpdatePostByPostId(queriesData, postId)
      await this.dbInstance.hitQuery(query, queryParams);
      await this.updatePostCategoryTable(postId, categroryId)
    }

    async deletePost(postId)
    {
      const query = 'DELETE FROM POST WHERE postId = ?'
      const result = await this.dbInstance.hitQuery(query, [postId]);
    }

    async deletePostByUser(userId)
    {
      const query = 'DELETE FROM POST WHERE userId = ?'
      const result = await this.dbInstance.hitQuery(query, [userId]);
    }


    async getPostByPostId(postId)
    {
      try {
        const getPost = 'SELECT * FROM POST WHERE postId = ?';
        const postData = await this.dbInstance.hitQuery(getPost, [postId]);
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
        const postData = await this.dbInstance.hitQuery(getPost, [userId]);
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

    async getPostByUserIdV2(userId, numberPosts)
    {
      try {
        const getPost =  `SELECT P.postId,
                                P.title,
                                P.summarize,
                                P.created_at,
                                P.updated_at,
                                U1.userId,
                                U1.userName,
                                I1.imageUrl AS thumbnailUrl,
                                I2.imageUrl AS avatarUrl
                          FROM POST P 
                          LEFT JOIN USER AS U1 ON U1.userId = P.userId
                          LEFT JOIN IMAGE AS I1 ON P.postId = I1.postId and I1.topic='thumnail'
                          LEFT JOIN IMAGE AS I2 ON P.userId = I2.userId and I2.topic='avatar'
                          LEFT JOIN FRIENDSHIPS AS F ON F.userAId = U1.userId AND F.userBId = ?
                          WHERE U1.userId = ? OR F.userBId = ?
                          ORDER BY P.updated_at DESC`
        const postData = await this.dbInstance.hitQuery(getPost, [userId, userId, userId]);
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
        const result = await this.dbInstance.hitQuery(numsPostQuery, [userId]);
        return result[0]['COUNT(*)']
      }
      catch (error) {
        return null
      }
    }

    async getNumberPostFollowedByUser(userId)
    {
      try {
        const numsPostQuery = `SELECT COUNT(*) as numberPost
                                FROM POST P 
                                LEFT JOIN USER AS U1 ON U1.userId = P.userId
                                LEFT JOIN IMAGE AS I1 ON P.postId = I1.postId and I1.topic='thumnail'
                                LEFT JOIN IMAGE AS I2 ON P.userId = I2.userId and I2.topic='avatar'
                                LEFT JOIN FRIENDSHIPS AS F ON F.userAId = U1.userId AND F.userBId = ?
                                WHERE U1.userId = ? OR F.userBId = ?;`;
        const result = await this.dbInstance.hitQuery(numsPostQuery, [userId, userId, userId]);
        console.log(result)
        return result[0]['numberPost']
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
        const result =await this.dbInstance.hitQuery(query, [categroryName]);
        return result.length > 0? result[0]: null;
      }
      catch (error) {
        return null
      }
    }

    async updatePostStatus(status, postId)
    {
      const query = "UPDATE POST set statusEdit = ? where postId = ?"
      const result = await this.dbInstance.hitQuery(query, [status, postId])
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
        const result = await this.dbInstance.hitQuery(query, [commentText, postId, userId, parentCommentId, commendId])
        if(result.affectedRows == 0)
        {
          throw new Error("No Comment was updated")
        }
      }
      else
      {
        const query = "INSERT INTO COMMENT  (commentId, commentText, postId, userId, parentCommentId) \
                       VALUES(UUID(), ?, ?, ?, ?)"
        const result = await this.dbInstance.hitQuery(query, [commentText, postId, userId, parentCommentId])
        if(result.affectedRows != 1)
        {
          throw new Error("Can not insert new comment")
        }
      }
      
    }

    async upSertLikeForPost(postId, userId)
    {
      const checkQuery = "SELECT * from LIKE_EMOTION WHERE postId = ? AND userId = ?"
      var result = await this.dbInstance.hitQuery(checkQuery, [postId, userId]);
      if(result.length == 1)
      {
        console.log(`Dislike Post ${postId}`)
        const deleteLikeQuery = "DELETE FROM LIKE_EMOTION WHERE likeId = ?"
        result = await this.dbInstance.hitQuery(deleteLikeQuery, [result[0].likeId]);
        if(result.affectedRows != 1)
        {
          throw new Error("Can not DisLike Post")
        }
      }
      else
      {
        console.log(`Like Post ${postId}`)
        const updateLike = 'INSERT INTO LIKE_EMOTION (likeId, postId, userId) VALUES (UUID(), ?, ?)';
        result = await this.dbInstance.hitQuery(updateLike, [postId, userId]);
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
        const commentData = await this.dbInstance.hitQuery(getCommentSql, [commentId]);
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
        const commentData = await this.dbInstance.hitQuery(getCommentSql, [parentCommentId]);
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
        const commentData = await this.dbInstance.hitQuery(getCommentSql, [postId]);
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
        const commentData = await this.dbInstance.hitQuery(deleteCommentSql, [commentId, userId]);
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