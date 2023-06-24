const express = require ('express')
const morgan = require ('morgan')
const helmet = require ('helmet')
const compress = require ('compression')
const app = express()
require('dotenv').config()
//A. init middeware
// 1. logging for server using morgan has 5 types (dev, combined, common, short, tiny)
app.use(morgan("common"))
// 2. helmet for protect info package http
// that helping CROS attack, so if test in local please comment it
// app.use(helmet())
// 3. compression reduce the size of package
app.use(compress())

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

app.use(express.json())
app.use(express.urlencoded({extends: true}))



//B. init db
require("./dbs/init.mysql")

//C. init handle error

//init routes
app.use(require("./routers"))

// handling error
app.use((req, res, next) => {
    console.log("centralize error")
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    console.log("hadling error")
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || "internal server error"
    })
})

module.exports = app