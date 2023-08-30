'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const UserService = require('../services/user.services')

class UserController {
    getMyProfile = async (req, res, next) => {
        var metaData = await UserService.getMyProfile(req)
        delete metaData.password
        const msg = new OK({
            message: "Getting My Profile Success",
            metaData: metaData
        })
        msg.send(res)
    }

    updateProfile  = async (req, res, next) => {
        var metaData = await UserService.updateProfile(req)
        delete metaData.password
        const msg = new OK({
            message: "Update My Profile Success",
            metaData: metaData
        })
        msg.send(res)
    }

    deleteProfile = async (req, res, next) => {
        var metaData = await UserService.deleteProfile(req)
        // delete metaData.password
        const msg = new OK({
            message: "Delete My Profile Success",
            metaData: metaData
        })
        msg.sendWithResetCookiesAfterLogout(res)
    }

    verifyEmailForUser = async (req, res, next) => {
        var metaData = await UserService.verifyEmailForUser(req)
        const msg = new OK({
            message: "Email has sent ",
            metaData: metaData
        })
        msg.send(res)
    }

    updateStatusVerifyForUser = async (req, res, next) => {
        var metaData = await UserService.updateStatusVerifyForUser(req)
        const msg = new OK({
            message: "Status Verified of user has updated ",
            metaData: metaData
        })
        msg.send(res)
    }
    
    friendRequest = async(req, res, next) => {
        var metaData = await UserService.friendRequest(req)
        const msg = new OK({
            message: "Your friend request was sent",
            metaData: metaData
        })
        msg.send(res)
    }

    answereRequest = async(req, res, next) => {
        var metaData = await UserService.answereRequest(req)
        const msg = new OK({
            message: "Your reply was sent",
            metaData: metaData
        })
        msg.send(res)
    }

    getFriendRequest = async(req, res, next) => {
        var metaData = await UserService.getFriendRequest(req)
        const msg = new OK({
            message: "Get List Friend Requests Successfullys",
            metaData: metaData
        })
        msg.send(res)
    }

    unfriend = async (req, res, next) => {
        var metaData = await UserService.unfriend(req)
        const msg = new OK({
            message: "Unfriend Successfullys",
            metaData: metaData
        })
        msg.send(res)
    }

    getMyFriends = async (req, res, next) => {
        var metaData = await UserService.getMyFriends(req)
        const msg = new OK({
            message: "Get List Friends Successfullys",
            metaData: metaData
        })
        msg.send(res)
    }

    getAllNotify = async (req, res, next) => {
        var metaData = await UserService.getAllNotify(req)
        const msg = new OK({
            message: "Get List Notifies Successfullys",
            metaData: metaData
        })
        msg.send(res)
    }
}

module.exports = new UserController()