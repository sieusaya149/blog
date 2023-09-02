const instanceMySqlDB = require('../dbs/init.mysql')
const UserQuery  = require('../dbs/user.mysql')
const KeyStoreQuery = require('../dbs/keystore.mysql')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {createTokenPair} = require("../auth/authUtils")
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const VerifyCodeQuery = require("../dbs/verifyCode.mysql")
const {generateVerificationCode} = require('../helpers/randomCode')
const mailTransport = require('../helpers/mailHelper')
const {TIMEOUT, VERIFYCODE_TYPE} = require('../configs/configurations')
const TransactionQuery = require('../dbs/transaction.mysql')
class AccessService
{
    //1. Check username and email does not exist in the database
    //2. Hashing password
    //3. Insert new User to DB
    //4. Create token pairs by publickey and privatekey
    //5. Store the pub, pri, accesstoken, refreshtoken 
    static signUp = async ({username, email, password, birth}) => {
        const exist = await UserQuery.checkUserExist(username,email)
        // for case db has problem
        if(exist == null)
        {
            throw new BadRequestError("Error: Issue in DB when register")
        }
        // check existing
        if (exist == true)
        {
            throw new BadRequestError("Error: username or email exist")
        }
        
        const passwordHashed = await bcrypt.hash(password, 10)

        await TransactionQuery.startTransaction()
        try {
            const newUser = await UserQuery.addUser(username, email, passwordHashed, birth)
            const publicKey = crypto.randomBytes(64).toString('hex')
            const privateKey = crypto.randomBytes(64).toString('hex')
            const tokens = await createTokenPair({userId: newUser, email: email},
                                                 publicKey,
                                                 privateKey)
            const newKey = await KeyStoreQuery.addKeyStore(publicKey,
                                                            privateKey,
                                                            tokens.accessToken,
                                                            tokens.refreshToken,
                                                            "{}",
                                                            newUser)
            await TransactionQuery.commitTransaction()
            return {newUserId: newUser,
                    newTokens: {
                        publicKey: publicKey,
                        accessKey: tokens.accessToken,
                        refreshKey: tokens.refreshToken
                    }}  
        } catch (error) {
            await TransactionQuery.rollBackTransaction()
            throw new BadRequestError("Error: Issue when create new user and keystore")       
        }           
    }

    /*
        1 - check username in dbs
        2 - check matching password
        3 - create accesstonken and refreshtoken
        4 - generate token
        5 - get data return login
    */ 
    static login = async ({username, email, password}) => {

        const userInstance =  await UserQuery.getUserName(username)
        // for case db has problem
        if(userInstance == null)
        {
            throw new BadRequestError("Fobbiden: Issue in DB when register") //403
        }
        if(password == undefined)
        {
            throw new BadRequestError("Fobbiden: Please provide more information ") //403
        }
        const match = await bcrypt.compare(password, userInstance.password)
        if(!match)
        {
            throw new AuthFailureError("Authentication Failed") // 400
        }

        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')
        const instanceId = userInstance.userId
        console.log(`update date key store for user ${instanceId}`)
        const tokens = await createTokenPair({userId: instanceId, email: email},
                                                 publicKey,
                                                 privateKey)
        const newKey = await KeyStoreQuery.addKeyStore(publicKey,
                                                         privateKey,
                                                         tokens.accessToken,
                                                         tokens.refreshToken,
                                                         "{}",
                                                         instanceId)
        console.log(`The new key has been added ${newKey}`)
        const metaData = {userId: instanceId,
                          newTokens: {accessKey: tokens.accessToken,
                                      refreshKey: tokens.refreshToken}
                         }
        const cookies = { accessToken: tokens.accessToken,
                          refreshToken: tokens.refreshToken,
                          userId: instanceId} 
        
        return {metaData, cookies}
    }
    
    static logout = async (keyStore) =>{
        //FIX ME USER ID need take from the access token rather than the request body
        console.log("clear key store")
        const delKey = await KeyStoreQuery.deleteKeyStore(keyStore.userId)
        console.log(`${delKey}`)
        return delKey
    }

    static forgotPassword = async (req) => {
        //1. check mail exist or not in body
        const email = req.body.email
        if(!email)
        {
            throw new BadRequestError("Please Fill Email") //403
        }
        //2. check mail exist or not in the db
        const userExist = await UserQuery.getUserFromMail(email)
        if(!userExist)
        {
            throw new BadRequestError("The email does not register yet") //403
        }
        //3. create new token
        // Generate a unique token
        const code = generateVerificationCode()
        const codeExpiry = Date.now() +  TIMEOUT.verifyCode; // Token expires in 1 hour
        console.log(`code is ${code}`)
        await VerifyCodeQuery.createNewVerifyCode(code, codeExpiry, VERIFYCODE_TYPE.FORGOT_PASSWORD, userExist.userId)
        mailTransport.send(email,'reset code', code)
        const cookies = { userId: userExist.userId } 
        const metaData = {
            link:"http://localhost:3000/v1/api/auth//auth/forgot-password/:id"
        }
       return {metaData, cookies}
    }

    static forgotPasswordVerify = async (req) => {
        const code = req.params.verifyCode
        const userId = req.cookies.userId
        const metaData = {}
        const cookies = {}
        const existingCode = await VerifyCodeQuery.checkCodeExistOrNot(code, userId, VERIFYCODE_TYPE.FORGOT_PASSWORD)
        if(existingCode != null)
        {
            cookies.verifyCode = code
        }
        else
        {
            throw new BadRequestError("Incorrect Code Please Fill Again")
        }
        
        return {metaData, cookies}
    }

    static resetPassword = async (req) => {
        // check password new and confirm exist
        const userId = req.cookies.userId
        const verifyCode = req.cookies.verifyCode
        const {newPassword, confirmPassword} = req.body
        if(!newPassword || !confirmPassword)
        {
            throw new BadRequestError('Not enough information request')
        }
        // check password new and confirm matched
        if(newPassword !== confirmPassword)
        {
            throw new BadRequestError('Both Password does not match together')
        }

        const passwordHashed = await bcrypt.hash(newPassword, 10)
        try {
            await UserQuery.updatePassword(passwordHashed, userId)
            await VerifyCodeQuery.deleteVerifyCode(verifyCode, userId, VERIFYCODE_TYPE.FORGOT_PASSWORD)
        } catch (error) {
            throw new BadRequestError('Update password is not successful')
        }
        return "Update Password Success"
    }
}

module.exports = AccessService