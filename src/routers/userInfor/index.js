'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
require('dotenv').config()
if(process.env.OFF_AUTHEN == true)
{
    router.use(authentication)
}
// logout api
// router.get('/:userId', asyncHanlder(UploadController.getImage))



module.exports = router