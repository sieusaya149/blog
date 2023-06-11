'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer');
const {asyncHanlder} = require('../../helpers/asyncHandler')
const UploadController = require('../../controllers/upload.controller')
const path = require('path');
const { authentication } = require('../../auth/authUtils')

// Determine the root directory of your project
const rootDirectory = path.dirname(require.main.filename);
// Construct the relative path to the uploads directory from the project's root
const relativeUploadsPath = 'uploads';
// Define the uploads directory relative to the blog directory
const uploadsDirectory = path.join(rootDirectory, 'uploads');
const upload = multer({ dest: uploadsDirectory });

router.use(authentication)
// logout api
router.post('/image', upload.single('image'), asyncHanlder(UploadController.uploadSingleImage))
router.post('/images', upload.array('images'), asyncHanlder(UploadController.uploadMultipleImage))
router.get('/:filename', asyncHanlder(UploadController.getImage))

module.exports = router