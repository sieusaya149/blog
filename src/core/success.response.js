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
            cookies = {}
        }
    )
    {
        this.message = !message ? reasonCode : message
        this.status = statusCode
        this.metaData = metaData
        this.cookies = cookies 
    }

    send (res, headers = {})
    {
        return res.status(this.status).json(this)
    }

    sendFile (res, filename)
    {
        return res.sendFile(filename)
    }

    sendWithCookies(res)
    {
        for (const property in this.cookies)
        {
            res.cookie(`${property}`, this.cookies[property], { httpOnly: true, secure: true });
        }
        return res.status(this.status).json(this)
    }
    // FIXME should have the way clear cookies that easy to understand more
    sendWithResetCookiesAfterLogout(res)
    {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.clearCookie('userId')
        return this.send(res)
    }
    // FIXME should have the way clear cookies that easy to understand more
    sendWithResetCookiesAfterResetPassword(res)
    {
        res.clearCookie('verifyCode')
        res.clearCookie('userId')
        return this.send(res)
    }
}


class OK extends SuccessResponse{
    constructor({message, metaData, cookies})
    {
        super({message, metaData, cookies})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = StatusCode.CREATED, reasonCode = ReasonCode.CREATED, metaData, cookies})
    {
        super({message, statusCode, reasonCode, metaData, cookies})
    }
}

module.exports = {
    OK, 
    CREATED
}