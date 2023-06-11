'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const PostService = require('../services/post.services')
class PostController
{
    // POST http://localhost:3055/post/posting
    updatePost = async (req, res, next) => {
        const imageFile = 
        new CREATED({
            message: "Update new Post Success!",
            metaData: await PostService.updatePost(req)
        }).send(res)
    }
    // POST http://localhost:3055/post/postId
    getPost = async (req, res, next) => {
        new CREATED({
            message: "Getting post success!",
            metaData: await PostService.getPost(req)
        }).send(res)
    }
    // POST http://localhost:3055/post/allpost
    getAllPost = async (req, res, next) => {
        new CREATED({
            message: "get all post by user id success!",
            metaData: await PostService.getAllPost(req)
        }).send(res)
    }

    
}

module.exports = new PostController()