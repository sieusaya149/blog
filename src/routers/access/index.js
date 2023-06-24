'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const accessController = require('../../controllers/access.controller')
const { authentication } = require('../../auth/authUtils')
require('dotenv').config()
// signup api
router.post('/auth/signUp', asyncHanlder(accessController.signUp))
router.post('/auth/login', asyncHanlder(accessController.login))
if(process.env.OFF_AUTHEN == true)
{
    router.use(authentication)
}
// logout api
router.post('/auth/logout', asyncHanlder(accessController.logout))


module.exports = router