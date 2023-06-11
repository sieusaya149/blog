'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const AccessService = require('../services/access.services')
class AccessController
{
    // @POST http://localhost:3055/v1/api/auth/signUp
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered Success!",
            metaData: await AccessService.signUp(req.body)
        }).send(res)
    }
    // @POST http://localhost:3055/v1/api/auth/login
    login = async (req, res, next) => {
        new CREATED({
            message: "Login Success!",
            metaData: await AccessService.login(req.body)
        }).send(res)
    }

    // @POST http://localhost:3055/v1/api/auth/logout
    logout = async (req, res, next) => {
        console.log("starting logout ")
        new CREATED({
            message: "Logout Success!",
            metaData: await AccessService.logout(req.keyStore)
        }).send(res)
    }
}

module.exports = new AccessController()