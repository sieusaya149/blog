'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const AccessService = require('../services/access.services')
class AccessController
{
    // @POST http://localhost:3055/v1/api/auth/signup
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered Success!",
            metaData: await AccessService.signUp(req.body)
        }).send(res)
    }
    // @POST http://localhost:3055/v1/api/auth/login
    login = async (req, res, next) => {
        const {metaData} = await AccessService.login(req,res)
        new CREATED({
            message: "Login Success!",
            metaData: metaData
        }).send(res)
    }

    googleLogin = async (req, res, next) => {
        const {metaData} = await AccessService.googleLogin(req, res)
        new CREATED({
            message: "Login By Google Success!",
            metaData: metaData
        }).send(res)
    }

    // @POST http://localhost:3055/v1/api/auth/logout
    logout = async (req, res, next) => {
        new CREATED({
            message: "Logout Success!",
            metaData: await AccessService.logout(req, res)
        }).send(res)
    }

    // @POST http://localhost:3055/v1/api/auth/forgot-password
    forgotPassword = async (req, res, next) => {
        const {metaData} = await AccessService.forgotPassword(req, res)
        new OK({
            message: "Sent Mail Successful",
            metaData: metaData,
        }).send(res)
    }
    // @POST http://localhost:3055/v1/api/auth/forgot-password/:verifyCode
    forgotPasswordVerify = async (req, res, next) => {
        const {metaData} = await AccessService.forgotPasswordVerify(req,res)
        new OK({
            message: "You Can Change New Password",
            metaData: metaData
        }).send(res)
    }
    // @POST http://localhost:3055/v1/api/auth/reset-password
    resetPassword = async(req, res, next) => {
        const {metaData} = await AccessService.resetPassword(req, res)
        new OK({
            message: "updated new password",
            metaData: metaData,
        }).send(res)
    }

    ping = async(req, res, next) => {
        new OK({
            message: "User Was Authenticated!"
        }).send(res)
    } 
}

module.exports = new AccessController()