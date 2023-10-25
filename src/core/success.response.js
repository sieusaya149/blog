'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201
}

const ReasonCode = {
    CREATED: "Created",
    OK: "Success"
}

class SuccessResponse {
    constructor(
        {
            message,
            statusCode = StatusCode.OK, 
            reasonCode = ReasonCode.OK,
            metaData = {},
        }
    )
    {
        this.message = !message ? reasonCode : message
        this.status = statusCode
        this.metaData = metaData
    }

    send (res, headers = {})
    {
        return res.status(this.status).json(this)
    }

    sendFile (res, filename)
    {
        return res.sendFile(filename)
    }
}


class OK extends SuccessResponse{
    constructor({message, metaData})
    {
        super({message, metaData})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = StatusCode.CREATED, reasonCode = ReasonCode.CREATED, metaData})
    {
        super({message, statusCode, reasonCode, metaData})
    }
}

module.exports = {
    OK, 
    CREATED
}