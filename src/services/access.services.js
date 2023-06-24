const instanceMySqlDB = require('../dbs/init.mysql')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {createTokenPair} = require("../auth/authUtils")
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const { access } = require('fs')
class AccessService
{
    //1. Check username and email does not exist in the database
    //2. Hashing password
    //3. Insert new User to DB
    //4. Create token pairs by publickey and privatekey
    //5. Store the pub, pri, accesstoken, refreshtoken 
    static signUp = async ({username, email, password, birth}) => {
        const exist = await instanceMySqlDB.checkUserExist(username,email)
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

        const newUser = await instanceMySqlDB.addUser(username, email, passwordHashed, birth)
        console.log(`Adding new user successfull with id ${newUser}`)

        if(newUser != null )
        {
            const publicKey = crypto.randomBytes(64).toString('hex')
            const privateKey = crypto.randomBytes(64).toString('hex')
            const tokens = await createTokenPair({userId: newUser, email: email},
                                                 publicKey,
                                                 privateKey)
            const newKey = await instanceMySqlDB.addKeyStore(publicKey,
                                                              privateKey,
                                                              tokens.accessToken,
                                                              tokens.refreshToken,
                                                              "{}",
                                                              newUser)
            console.log(`The new key has been added ${newKey}`)
            return {
                code: 201,
                metadata:{
                    newUserId: newUser,
                    newTokens:{
                        publicKey: publicKey,
                        accessKey: tokens.accessToken,
                        refreshKey: tokens.refreshToken
                    }
                }
            }                                     
        }
        throw new BadRequestError("Error: Issue when create new user and keystore")       
    }

    /*
        1 - check username in dbs
        2 - check matching password
        3 - create accesstonken and refreshtoken
        4 - generate token
        5 - get data return login
    */ 
    static login = async ({username, email, password}) => {
        // const exist = await instanceMySqlDB.checkUserExist(username, "")

        const userInstance =  await instanceMySqlDB.getUserName(username)
        // for case db has problem
        if(userInstance == null)
        {
            throw new BadRequestError("Error: Issue in DB when register")
        }
        if(password == undefined)
        {
            throw new BadRequestError("Error: Please provide more information ")
        }
        const match = bcrypt.compare(password, userInstance.password)
        if(!match)
        {
            throw new AuthFailureError("Authentication Failed")
        }

        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')
        const instanceId = userInstance.userId
        console.log(`update date key store for user ${instanceId}`)
        const tokens = await createTokenPair({userId: instanceId, email: email},
                                                 publicKey,
                                                 privateKey)
        const newKey = await instanceMySqlDB.addKeyStore(publicKey,
                                                         privateKey,
                                                         tokens.accessToken,
                                                         tokens.refreshToken,
                                                         "{}",
                                                         instanceId)
        console.log(`The new key has been added ${newKey}`)
        return {
            code: 201,
            metadata:{
                userId: instanceId,
                newTokens:{
                    publicKey: publicKey,
                    accessKey: tokens.accessToken,
                    refreshKey: tokens.refreshToken
                }
            }
        }                                     
    }
    
    static logout = async (keyStore) =>{
        //FIX ME USER ID need take from the access token rather than the request body
        console.log("clear key store")
        const delKey = await instanceMySqlDB.deleteKeyStore(keyStore.userId)
        console.log(`${delKey}`)
        return delKey
    }
}

module.exports = AccessService