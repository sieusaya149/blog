'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const UserController = require('../../controllers/user.controller')
const userController = require('../../controllers/user.controller')
require('dotenv').config()

router.use(authentication)

// logout api
router.get('/myProfile', asyncHanlder(UserController.getMyProfile))
router.put('/updateProfile', asyncHanlder(UserController.updateProfile))
router.delete('/deleteProfile', asyncHanlder(UserController.deleteProfile))

router.post('/verify', asyncHanlder(userController.verifyEmailForUser))
router.post('/verify/:verifyCode', asyncHanlder(userController.updateStatusVerifyForUser))

// friend request
router.post('/friend_request/:friendId', asyncHanlder(userController.friendRequest))
router.post('/answere_request/:requesterId', asyncHanlder(userController.answereRequest))

module.exports = router