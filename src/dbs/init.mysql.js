'use strict'
let mysql = require('mysql2'); // should be using mysql2 for authentication
const {DB_QUERYs} = require("../configs/configurations")
require('dotenv').config()

const MYSQL_HOST = process.env.MYSQL_HOST
const MYSQL_PORT = process.env.MYSQL_PORT
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_DATABASE = process.env.MYSQL_DATABASE
const MYSQL_NUMBER_CONNECTS = process.env.MYSQL_NUMBER_CONNECTS

const TYPE_CONNECTION_DB = {
	pool: "pool",
	single: "single"
}
class Database
{
    constructor(type = TYPE_CONNECTION_DB.pool)
    {
		this.type = type
		if(type == TYPE_CONNECTION_DB.pool)
		{
			this.pool = this.createPoolConnetion()
		}
        // if( this.connection != null)
        // {
            // this.executeQuery(DB_QUERYs.CREATE_APIKEY_TABLE, "CREATE_APIKEY_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_USER_TABLE, "CREATE_USER_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_TAG_TABLE, "CREATE_TAG_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_CATEGORY_TABLE, "CREATE_CATEGORY_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_POST_TABLE, "CREATE_POST_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_POSTTAG_TABLE, "CREATE_POSTTAG_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_POSTCATEGORY_TABLE, "CREATE_POSTCATEGORY_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_IMAGE_TABLE, "CREATE_IMAGE_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_KEY_STORE_TABLE, "CREATE_KEY_STORE_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_VERIFY_CODE_TABLE,"CREATE_VERIFY_CODE_TABLE");
            // this.executeQuery(DB_QUERYs.CREATE_COMMENT_TABLE, "CREATE_COMMENT_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_LIKE_EMOTION_TABLE, "CREATE_LIKE_EMOTION_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_FOLLOW_LIST_TABLE, "CREATE_FOLLOW_LIST_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_FRIEND_REQUESTS_TABLE, "CREATE_FRIEND_REQUESTS_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_TABLE_FRIENDSHIPS, "CREATE_TABLE_FRIENDSHIPS")
            // this.executeQuery(DB_QUERYs.CREATE_SAVELIST_TABLE, "CREATE_SAVELIST_TABLE")
            // this.executeQuery(DB_QUERYs.CREATE_SAVELIST_POST_TABLE, "CREATE_SAVELIST_POST_TABLE")
        // }
    }

    // singleton
    static getInstance()
    {
        if(!Database.instance)
        {
            Database.instance = new Database()
        }
        return Database.instance
    }

	setTypeConnection(type)
	{
		if(type !== TYPE_CONNECTION_DB.pool || type !== TYPE_CONNECTION_DB.single)
		{
			console.log(`Set new types ${type} does not successfully`)
			return;
		}
		console.log(`Change connection to DB to new types ${type} successfully`)
		this.type = type
	}

    createPoolConnetion()
    {
        return mysql.createPool({host: MYSQL_HOST || 'mysql',
								user: MYSQL_USER || 'hunghoang',
								password: MYSQL_PASSWORD || '123',
								database: MYSQL_DATABASE || 'blog',
								connectionLimit: MYSQL_NUMBER_CONNECTS || 10})
    }

    createNewConnection()
    {
		return mysql.createConnection({host: MYSQL_HOST || 'mysql',
										user: MYSQL_USER || 'hunghoang',
										password: MYSQL_PASSWORD || '123',
										database: MYSQL_DATABASE || 'blog'});
    }

    hitQuery(query, params) {
		if(this.type == 'pool')
		{
			return this.poolQuery(query, params)
		}
		else if(this.type == 'single')
		{
			return this.singleConnectionQuery(query, params)
		}
    }
    
    poolQuery(query, params) {
		if(!this.pool)
		{
			throw new Error("The pool connection does not exist")
		}
		return new Promise((resolve, reject) => {
			this.pool.execute(query, params, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
			});
		});
    }

    async singleConnectionQuery(query, params) {
		const connection = this.createNewConnection()
		connection.connect(function(err) {
			if (err)
			{ 
			  console.log(`Connect failed with error ${err}`)
			  return null;
			}
		});
		return new Promise((resolve, reject) => {
			connection.execute(query, params, (error, results) => {
				connection.end()
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
    }
   
    async getKeyStore(userId)
    {
      // console.log(`userid ${userId}`)
      try {
        const query = 'SELECT * FROM KEYSTORE WHERE userId = ? ';
        const result = await this.hitQuery(query, [userId]);
        return result.length > 0? result[0]: null;
      }
      catch (error) {
        return null
      }
    }
    

    async addKeyStore(publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId) {
        await this.deleteKeyStore(userId)
        console.log(`Insert new keystore for user ${userId}`)
        const insertQuery = `INSERT INTO KEYSTORE (keyStoreId, publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId)
                             VALUES (UUID(),?, ?, ?, ?, ?, ?)`;
        await this.hitQuery(insertQuery, [publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId]);
        
        const getKeyIdQuery = 'SELECT LAST_INSERT_ID() as keyStoreId';
        const keyIdResult = await this.hitQuery(getKeyIdQuery);
        return keyIdResult[0].id;
    }

    async deleteKeyStore(userId) {
        const checkQuery = 'SELECT 1 FROM KEYSTORE WHERE userId = ?';
        const checkResults = await this.hitQuery(checkQuery, [userId]);
        if (checkResults.length > 0)
        {
          console.log(`delete keystore for user ${userId}`)
          const deleteQuery = `DELETE FROM KEYSTORE WHERE userId = ?`;
          await this.hitQuery(deleteQuery, [userId]);
        }
    }
}

const instanceMySqlDB = Database.getInstance()
module.exports = instanceMySqlDB