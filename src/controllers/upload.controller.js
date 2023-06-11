'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const UploadService = require('../services/upload.services')
class UploadController
{
    // @POST http://localhost:3055/v1/api/auth/signUp
    uploadSingleImage = async (req, res, next) => {
        new CREATED({
            message: "Uploaded a Image Success!",
            metaData: await UploadService.uploadSingleImage(req)
        }).send(res)
    }

    uploadMultipleImage = async (req, res, next) => {
        new CREATED({
            message: "Uploaded Multiple Image Success!",
            metaData: await UploadService.uploadMultipleImage(req)
        }).send(res)
    }

    getImage = async (req, res, next) => {
        const imageFile = await UploadService.getImage(req)
        new CREATED({
            message: "Getting Image Success!",
            metaData: imageFile
        }).sendFile(res, imageFile)
    }
}

module.exports = new UploadController()