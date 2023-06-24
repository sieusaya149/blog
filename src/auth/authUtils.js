const JWT = require('jsonwebtoken')
const instanceMySqlDB = require('../dbs/init.mysql')
const {asyncHanlder} = require('../helpers/asyncHandler')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION : 'authorization',
    CLIENT_ID: 'x-client-id',
}

// FIX me because currently in the source code, the keys are not key pair
// so that we only use private key
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // create access token by private key
        const accessToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        })
        // refresh access token by private key
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, privateKey, (err, decode) => {
            if(err){
                console.error(`error verify: `, err)
            }
            else{
                console.log(`decode verify: `, decode)
            }
        })
        return {accessToken, refreshToken}
    } catch (error) {
        console.log(error)
    }
}


const authentication = asyncHanlder(async (req, res, next) => {
    /*
        1. check userId misisng or not 
        2. get accesstonken
        3. verify token
        4. check user in dbs
        5. check keyStore with user
        6. oke all => return next()
    */
   const userId = req.headers[HEADER.CLIENT_ID]

   //1
   if(!userId)
   {
       throw new AuthFailureError('Invalid request')
   }
   //2
   const keyStore = await instanceMySqlDB.getKeyStore(userId)
   console.log(`Key store maybe is ${keyStore}`)
   if(keyStore == null)
   {
       throw new BadRequestError('Not Found User Id')
   }
   //3
   const accessToken = req.headers[HEADER.AUTHORIZATION]
   if(!accessToken)
   {
       throw new AuthFailureError("Invalid authorization")
   }

   try {
       console.log(`public key ${keyStore.publicKey} and private key ${keyStore.privateKey}`)
       const decodeUser = JWT.verify(accessToken, keyStore.privateKey)
       if(userId !== decodeUser.userId)
       {
            throw new AuthFailureError("Can not verify key")
       }
       req.keyStore = keyStore
       console.log(keyStore)
       next()

   } catch (error) {
        throw new AuthFailureError("Is there something wrong when verify key")
   }

})

module.exports = {createTokenPair, authentication}