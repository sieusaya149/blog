'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer');
const {asyncHanlder} = require('../../helpers/asyncHandler')
const UploadController = require('../../controllers/upload.controller')
const path = require('path');
const { authentication } = require('../../auth/authUtils');
const { randomUUID } = require('crypto');

// Determine the root directory of your project
const rootDirectory = path.dirname(require.main.filename);



// configure storage and multer for image and video
const uploadImageDirectory = path.join(rootDirectory, 'uploads/images');
const imagesStorage = multer.diskStorage(
  {
    destination: uploadImageDirectory,
    filename: (req, file, cb) => {
      const nameImage = randomUUID() 
      cb(null, nameImage + '_' + Date.now()
        + path.extname(file.originalname))
    }
  });
const imageUpload = multer({
    storage: imagesStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 //  5 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
}) 

const uploadVideoDirectory = path.join(rootDirectory, 'uploads/videos')
const videosStorage = multer.diskStorage(
  {
    destination: uploadVideoDirectory,
    filename: (req, file, cb) => {
      const nameVideo = randomUUID() 
      cb(null, nameVideo + '_' + Date.now()
        + path.extname(file.originalname))
    }
  });
const videoUpload = multer({
  storage: videosStorage,
  limits: {
  fileSize: 200 * 1024 * 1024 // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    // upload only mp4 and mkv format
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
       return cb(new Error('Please upload a video'))
    }
    cb(undefined, true)
 }
})

require('dotenv').config()
if(process.env.OFF_AUTHEN == true)
{
    router.use(authentication)
}
// upload and get images
router.post('/image', imageUpload.single('image'), asyncHanlder(UploadController.uploadSingleImage))
router.post('/images', imageUpload.array('images'), asyncHanlder(UploadController.uploadMultipleImage))

// upload video
router.post('/video', videoUpload.single('video'),  asyncHanlder(UploadController.uploadSingleVideo))

// upload video
// router.post('/video', )

module.exports = router