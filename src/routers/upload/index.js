'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer');
const {asyncHanlder} = require('../../helpers/asyncHandler')
const UploadController = require('../../controllers/upload.controller')
const upload = multer({ dest: '/Users/hunghoang/project/blogging_BE_site/uploads/' });
// router.use(authentication)
// logout api
router.post('/image', upload.single('image'), asyncHanlder(UploadController.uploadSingleImage))
router.post('/images', upload.array('images'), asyncHanlder(UploadController.uploadMultipleImage))
router.get('/:filename', asyncHanlder(UploadController.getImage))

module.exports = router