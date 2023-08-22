'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const PostController = require('../../controllers/post.controller')
require('dotenv').config()

router.use(authentication)


// logout api
router.post('/publish', asyncHanlder(PostController.publishPost))
router.put('/republish/:postId', asyncHanlder(PostController.rePublishPost))
router.put('/unpublish/:postId', asyncHanlder(PostController.unpublishPost))

router.get('/read/:postId', asyncHanlder(PostController.readSinglePost))
// FIXME the categrory can be multiple value, how to edit
router.put('/edit/:postId', asyncHanlder(PostController.editPost))
router.delete('/delete/post/:postId', asyncHanlder(PostController.deletePost))
// router.post('/delete/:postId', asyncHanlder(PostController.editComment))
// FIXME the comment just is basic, in the future hard to development, should spend time refactor
router.post('/comment/put/:postId', asyncHanlder(PostController.commentPost))
router.delete('/comment/delete/:commentId', asyncHanlder(PostController.deleteComment))
router.get('/comment/get/:postId', asyncHanlder(PostController.getComment))
// get all comments and subcomment
router.get('/comment/getAll/:postId', asyncHanlder(PostController.getAllComment))


router.post('/like/:postId', asyncHanlder(PostController.likePost))
// router.post('/save-change/:postId', asyncHanlder(PostController.updatePost)) // save in draf style
// router.post('/delta/:postId', asyncHanlder(PostController.updatePost))
// router.post('/add-reading-list/:postId', asyncHanlder(PostController.updatePost))






router.get('/allPost', asyncHanlder(PostController.getAllPost))

router.get('/:postId', asyncHanlder(PostController.getPost))



module.exports = router