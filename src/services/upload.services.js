const instanceMySqlDB = require('../dbs/init.mysql')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const path = require('path');
const ImageData = require('../dbs/image.mysql')


class UploadService
{
    static uploadSingleImage = async (req) =>{
        /// Image file is stored in req.file
        const { filename } = req.file;
        console.log(filename)
        // Generate blob link
        const blobLink = req.protocol + '://' + req.get('host') + '/images/' + filename;

        // Send the blob link back to the client
        console.log(blobLink)
        const newImage = await ImageData.insertImageToDb(blobLink,'avatar',req.headers['userid'], null)
        console.log(newImage)
        return blobLink;
    }

    static uploadMultipleImage = async (req) => {
        console.log('Uploading many files')
        // Array of image files is stored in req.files
        const blobLinks = [];
      
        // Process each file
        req.files.forEach(file => {
          const { filename } = file;
      
          // Generate blob link
          const blobLink = req.protocol + '://' + req.get('host') + '/uploads/' + filename;
          blobLinks.push(blobLink);
      
          // Perform any additional operations (e.g., storing in the database)
      
        });
      
        // Send the blob links back to the client
        return blobLinks;
      }
    

      static uploadSingleVideo = async (req) =>{
        /// Image file is stored in req.file
        const { filename } = req.file;
        // console.log(filename)
        // Generate blob link
        const blobLink = req.protocol + '://' + req.get('host') + '/videos/' + filename;

        // Send the blob link back to the client
        console.log(blobLink)
        // const newImage = await ImageData.insertImageToDb(blobLink,'avatar',req.headers['userid'], null)
        // console.log(newImage)
        return blobLink;
      }
}

module.exports = UploadService