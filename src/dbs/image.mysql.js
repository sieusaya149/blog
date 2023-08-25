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
        await this.upSertImage(imageUrl, topic, userId, postId)
        const imageId = await this.getImageFromUrl(imageUrl)
        return imageId;
      }
      catch (error) {
        throw new BadRequestError("The issue when uploading image ", 400)
      }
    }

    async getImageFromUrl(imageUrl)
    {
      try {
        const getImageInserted = 'SELECT * FROM IMAGE WHERE imageUrl = ?';
        const imageId = await this.dbInstance.executeQueryV2(getImageInserted, [imageUrl]);
        return imageId
      } catch (error) {
        throw new Error("Can not get image that was upserted")
      }
    }

    async upSertImage(imageUrl, topic, userId, postId)
    {
      try {
        const query = 'SELECT * FROM IMAGE WHERE userId = ? AND topic = ? AND postId = ?';
        const imagesExisting = await this.dbInstance.executeQueryV2(query, [userId, topic, postId]);
        if(imagesExisting.length == 1 && topic == 'avatar' )
        {
          // FIXME should delete image on disk also
          const query = "UPDATE IMAGE set imageUrl = ? where userId = ? and topic = ?"
          const result = await this.dbInstance.executeQueryV2(query, [imageUrl, userId, topic])
          if(result.affectedRows == 0)
          {
            throw new Error("No Avatar was updated")
          }
          console.log('UPDATE: the existing image in db was updated successfully')
        }
        else if (imagesExisting.length == 1 && topic == 'thumnail')
        {
            // FIXME should delete image on disk also
            const query = "UPDATE IMAGE set imageUrl = ? where postId = ? and topic = ?"
            const result = await this.dbInstance.executeQueryV2(query, [imageUrl, postId, topic])
            if(result.affectedRows == 0)
            {
              throw new Error("No Thumbnail was updated")
            }
            console.log('UPDATE: the existing image in db was updated successfully')
        }
        else
        {
          const query = 'INSERT INTO IMAGE (imageId, imageUrl, topic, postId, userId)\
                         VALUES (UUID(), ?, ?, ?, ?)';
          const result = await this.dbInstance.executeQueryV2(query, [imageUrl, topic, postId, userId]);
          if(result.affectedRows != 1)
          {
            throw new Error("Can not insert new image")
          }
          console.log('INSERT: the new image was inserted successfully')
        }
      }
      catch (error) {
        console.log(error)
        throw new BadRequestError("The issue when uploading image ", 400)
      }
    }
}

module.exports = new ImageData()