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
        const {metaData, cookies} = await AccessService.login(req.body)
        const msg = new CREATED({
            message: "Login Success!",
            metaData: metaData,
            cookies: cookies
        })
        msg.sendWithCookies(res)
    }

    // @POST http://localhost:3055/v1/api/auth/logout
    logout = async (req, res, next) => {
        const msg = new CREATED({
            message: "Logout Success!",
            metaData: await AccessService.logout(req.keyStore)
        })
        msg.sendWithResetCookiesAfterLogout(res)
    }

    // @POST http://localhost:3055/v1/api/auth/forgot-password
    forgotPassword = async (req, res, next) => {
        const {metaData, cookies} = await AccessService.forgotPassword(req)
        const msg = new OK({
            message: "Sent Mail Successful",
            metaData: metaData,
            cookies: cookies
        })
        msg.sendWithCookies(res)
    }
    // @POST http://localhost:3055/v1/api/auth/forgot-password/:verifyCode
    forgotPasswordVerify = async (req, res, next) => {
        const {metaData, cookies} = await AccessService.forgotPasswordVerify(req)
        const msg = new OK({
            message: "You Can Change New Password",
            metaData: metaData,
            cookies: cookies
        })
        msg.sendWithCookies(res)
    }
    // @POST http://localhost:3055/v1/api/auth/reset-password
    resetPassword = async(req, res, next) => {
        const {metaData, cookies} = await AccessService.resetPassword(req)
        const msg = new OK({
            message: "updated new password",
            metaData: metaData,
            cookies: cookies
        })
        msg.sendWithResetCookiesAfterResetPassword(res)
    }
}

module.exports = new AccessController()