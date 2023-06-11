'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

router.use(authentication)
// logout api
// router.get('/:userId', asyncHanlder(UploadController.getImage))



module.exports = router