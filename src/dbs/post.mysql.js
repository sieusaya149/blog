const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { v4: uuidv4 } = require('uuid');
class PostData {
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
                       content, userId, categroryId) \
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await this.dbInstance.executeQueryV2(query, [postId, title, statusEdit, sharePermit,
                                                     summarize, content, userId, categoryId]);
        const getPost = 'SELECT * FROM POST WHERE postId = ?';
        const postData = await this.dbInstance.executeQueryV2(getPost, [postId]);
        const updatePostCategory = 'INSERT INTO POSTCATEGORY (categroryId, postId) VALUES (?, ?)';
        await this.dbInstance.executeQueryV2(updatePostCategory, [categoryId, postData[0].postId]);
        return postId;
      }
      catch (error) {
        console.log(error)
        return null
      }
    }

    async getPostByPostId(postId)
    {
      try {
        const getPost = 'SELECT * FROM POST WHERE postId = ?';
        const postData = await this.dbInstance.executeQueryV2(getPost, [postId]);
        console.log(postData)
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
        console.log(postData)
        if(postData.length > 1)
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
}

module.exports = new PostData()