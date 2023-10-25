'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const accessController = require('../../controllers/access.controller')


//when the google login success full this endpoint will be triggered
router.get('/google/login', asyncHanlder(accessController.googleLogin))
router.get('/google/callback/login', asyncHanlder(accessController.callbackGoogleLogin))

module.exports = router