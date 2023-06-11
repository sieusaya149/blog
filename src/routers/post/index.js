'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const PostController = require('../../controllers/post.controller')


router.use(authentication)
// logout api
router.post('/posting', asyncHanlder(PostController.updatePost))
router.post('/allpost', asyncHanlder(PostController.getAllPost))

router.get('/:postId', asyncHanlder(PostController.getPost))



module.exports = router