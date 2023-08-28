const instanceMySqlDB = require('../dbs/init.mysql')
const UserQuery  = require('../dbs/user.mysql')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {createTokenPair} = require("../auth/authUtils")
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const VerifyCodeQuery = require("../dbs/verifyCode.mysql")
const {generateVerificationCode} = require('../helpers/randomCode')
const mailTransport = require('../helpers/mailHelper')
const {TIMEOUT, VERIFYCODE_TYPE} = require('../configs/configurations')
const TransactionQuery = require('../dbs/transaction.mysql')

class UserService
{
    static getMyProfile = async (req) =>
    {
        const userId = req.cookies.userId
        try {
            const userData = await UserQuery.getUserById(userId)
            return userData
        } catch (error) {
            throw new Error(`Get Profile failed with reason ${error}`)
        }
    }

    static updateProfile = async (req) =>
    {
        const userId = req.cookies.userId
        const {userName, email, bio, birthDay} = req.body
        const queries = {
            userName: userName,
            email: email,
            bio: bio,
            birthDay: birthDay
        }
        try {
            const newUserData = await UserQuery.updateUserProfile(queries, userId)
            return newUserData
        } catch (error) {
            throw new Error(`Get Profile failed with reason ${error}`)
        }
    }

    static deleteProfile = async (req) => 
    {
        const userId = req.cookies.userId
        try {
            return await UserQuery.deleteUser(userId)
        } catch (error) {
            throw new Error(`Delete Profile failed with reason ${error}`)
        }
    }

    static verifyEmailForUser = async (req) => 
    {
        const userId = req.cookies.userId
        const userData = await UserQuery.getUserById(userId)
        if(!userData)
        {
            throw new BadRequestError("The user does not exist")
        }
        if(userData.verified)
        {
            throw new BadRequestError("The user has been verified")
        }
        try{
            const code = generateVerificationCode()
            const codeExpiry = Date.now() +  TIMEOUT.verifyCode; // Token expires in 1 hour
            await VerifyCodeQuery.createNewVerifyCode(code, codeExpiry, VERIFYCODE_TYPE.VERIFY_EMAIL, userData.userId)
            mailTransport.send(userData.email,'reset code', code)
            const metaData = {
                link:`http://localhost:3000/v1/api/user/auth/verify/${code}`
            }
            return metaData
        } catch (error) {
            throw new Error(`verify email for user failed with reason ${error}`)
        }
    }

    static updateStatusVerifyForUser = async (req) => {
        const userId = req.cookies.userId
        const verifyCode = req.params.verifyCode
        if(!verifyCode || !userId)
        {
            throw new BadRequestError('Please give more information')
        }
        const existingCode = await VerifyCodeQuery.checkCodeExistOrNot(verifyCode, userId, VERIFYCODE_TYPE.VERIFY_EMAIL)
        if(existingCode == null)
        {
            throw new BadRequestError("Incorrect Code Please Fill Again")
        }
        try {
            await UserQuery.updateVerifiedStatus(true, userId)
            await VerifyCodeQuery.deleteVerifyCode(verifyCode, userId, VERIFYCODE_TYPE.VERIFY_EMAIL)
        } catch (error) {
            throw new BadRequestError(`Update status verified of user is not successful with reason ${error}`)
        }
        
        return {}
    }

    static friendRequest = async (req) => {
        const requesterId = req.cookies.userId
        const recipientId = req.params.friendId
        
        if(!requesterId || !recipientId)
        {
            throw new BadRequestError('Please give more information')
        }
        try {
            await FriendQuery.addNewFriendRequest(requesterId, recipientId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {}
    }
        return {}
    }
}


module.exports = UserService