'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const accessController = require('../../controllers/access.controller')
const { authentication } = require('../../auth/authUtils')

// signup api
router.post('/auth/signUp', asyncHanlder(accessController.signUp))
router.post('/auth/login', asyncHanlder(accessController.login))

router.use(authentication)
// logout api
router.post('/auth/logout', asyncHanlder(accessController.logout))


module.exports = router