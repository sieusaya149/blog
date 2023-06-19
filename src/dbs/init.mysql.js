'use strict'
let mysql = require('mysql2'); // should be using mysql2 for authentication
const {DB_QUERYs} = require("../configs/configurations")
require('dotenv').config()

class Database
{
    constructor()
    {
        this.connection = this.connect()
        if( this.connection != null)
        {
            this.executeQuery(DB_QUERYs.CREATE_APIKEY_TABLE, "CREATE_APIKEY_TABLE")

            this.executeQuery(DB_QUERYs.CREATE_USER_TABLE, "CREATE_USER_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_TAG_TABLE, "CREATE_TAG_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_CATEGORY_TABLE, "CREATE_CATEGORY_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_POST_TABLE, "CREATE_POST_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_POSTTAG_TABLE, "CREATE_POSTTAG_TABLE")
            this.executeQuery(DB_QUERYs.CREATE_POSTCATEGORY_TABLE, "CREATE_POSTCATEGORY_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_IMAGE_TABLE, "CREATE_IMAGE_TABLE");
            this.executeQuery(DB_QUERYs.CREATE_KEY_STORE_TABLE, "CREATE_KEY_STORE_TABLE");
        }
    }
     connect()
    {
        const MYSQL_HOST = process.env.MYSQL_HOST
        const MYSQL_PORT = process.env.MYSQL_PORT
        const MYSQL_USER = process.env.MYSQL_USER
        const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
        const MYSQL_DATABASE = process.env.MYSQL_DATABASE
        console.log(`Connect to MYSQL ${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT} with ${MYSQL_PASSWORD} to DB ${MYSQL_DATABASE}}`)
        const connection = mysql.createConnection({host: MYSQL_HOST || 'mysql',
                                                  user: MYSQL_USER || 'hunghoang',
                                                  password: MYSQL_PASSWORD || '123',
                                                  database: MYSQL_DATABASE || 'blog'
                                                  });

        connection.connect(function(err) {
          if (err)
          { 
            console.log(`Connect failed with error ${err}`)
            return null;
          }
          console.log(`Connected MySQL Successfully `)
        });
    
        return connection
    }

    executeQuery(query, logging) {
        return this.connection.query(query, (err) => {
          if (err) {
            throw err;
          }
          console.log(`${logging}`);
        });
      }

    executeQueryV2(query, params) {
      return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
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


    async checkUserExist(username, email) {
      try {
        const query = 'SELECT COUNT(*) as count FROM USER WHERE username = ? OR email = ?';
        const results = await this.executeQueryV2(query, [username, email]);
        const count = results[0].count;
        return count > 0? true: false;
      } catch (error) {
        console.log(error)
        return null
      }
    }
    async getUserName(username)
    {
      try {
        const query = 'SELECT * FROM USER WHERE username = ? ';
        const result = await this.executeQueryV2(query, [username]);
        return result.length != 0? result[0]: null;
      }
      catch (error) {
        console.log(username)
        return null
      }
    }

    async getKeyStore(userId)
    {
      console.log(`userid ${userId}`)
      try {
        const query = 'SELECT * FROM KEYSTORE WHERE userId = ? ';
        const result = await this.executeQueryV2(query, [userId]);
        return result.length > 0? result[0]: null;
      }
      catch (error) {
        return null
      }
    }
    // adding user to database
    async addUser(username, email, password, birthDay) {
      try {
        // we have 2 query, first for inserting, the second for getting the lastest id that
        // was inserted
        const query = 'INSERT INTO USER (userId, userName, email, password, birthDay) VALUES (UUID(), ?, ?, ?, ?)';
        await this.executeQueryV2(query, [username, email, password, birthDay]);
        const getUserIdQuery = 'SELECT userId FROM USER WHERE userName = ?';
        const userIdResult = await this.executeQueryV2(getUserIdQuery, [username]);
        return userIdResult[0].userId;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
   

    //adding new keystore to database
    // async addKeyStore(publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId) {
    //   try {

    //     // const query = 'INSERT INTO KEYSTORE (publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId) VALUES (?, ?, ?, ?, ?, ?)';
    //     const query = `INSERT INTO KEYSTORE (publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId)
    //                    VALUES (?, ?, ?, ?, ?, ?)
    //                   ON DUPLICATE KEY UPDATE
    //                   publicKey = VALUES(publicKey),
    //                   privateKey = VALUES(privateKey),
    //                   accessToken = VALUES(accessToken),
    //                   refreshToken = VALUES(refreshToken),
    //                   refreshTokenUsed = VALUES(refreshTokenUsed)
    //                   `;
    //     await this.executeQueryV2(query, [publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId]);
    //     const getKeyIdQuery = 'SELECT LAST_INSERT_ID() as id';
    //     const keyIdResult = await this.executeQueryV2(getKeyIdQuery);
    //     return keyIdResult[0].id;
    //   } catch (error) {
    //     console.error(error);
    //     throw error;
    //   }
    // }

    async addKeyStore(publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId) {
      try {
        await this.deleteKeyStore(userId)
        console.log(`Insert new keystore for user ${userId}`)
        const insertQuery = `INSERT INTO KEYSTORE (keyStoreId, publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId)
                             VALUES (UUID(),?, ?, ?, ?, ?, ?)`;
        await this.executeQueryV2(insertQuery, [publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId]);
        
        const getKeyIdQuery = 'SELECT LAST_INSERT_ID() as keyStoreId';
        const keyIdResult = await this.executeQueryV2(getKeyIdQuery);
        return keyIdResult[0].id;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    async deleteKeyStore(userId) {
      try {
        const checkQuery = 'SELECT 1 FROM KEYSTORE WHERE userId = ?';
        const checkResults = await this.executeQueryV2(checkQuery, [userId]);
        if (checkResults.length > 0)
        {
          console.log(`delete keystore for user ${userId}`)
          const deleteQuery = `DELETE FROM KEYSTORE WHERE userId = ?`;
          await this.executeQueryV2(deleteQuery, [userId]);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    async getCategory(categroryName)
    {
      try {
        const query = 'SELECT * FROM CATEGORY WHERE categroryName = ? ';
        const result = await this.executeQueryV2(query, [categroryName]);
        return result.length > 0? result[0]: null;
      }
      catch (error) {
        return null
      }
    }
}

const instanceMySqlDB = Database.getInstance()
module.exports = instanceMySqlDB