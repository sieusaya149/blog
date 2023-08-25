const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { BadRequestError } = require('../core/error.response');

class ImageData {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
    async insertImageToDb(imageUrl, topic, userId=null, postId=null)
    {
      try {
        const query = 'INSERT INTO IMAGE (imageId, imageUrl, topic, postId, userId)\
                       VALUES (UUID(), ?, ?, ?, ?)';
        await this.dbInstance.executeQueryV2(query, [imageUrl, topic, postId, userId]);
        const getImageInserted = 'SELECT * FROM IMAGE WHERE imageUrl = ?';
        const imageId = await this.dbInstance.executeQueryV2(getImageInserted, [imageUrl]);
        return imageId;
      }
      catch (error) {
        throw new BadRequestError("The issue when uploading image ", 400)
      }
    }
}

module.exports = new ImageData()