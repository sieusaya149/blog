const instanceMySqlDB = require('./init.mysql');
const QueryBase = require('./queryBase')
const SqlBuilder = require('../utils/sqlBuilder')
class UserQuery extends QueryBase {
    constructor()
    {
        super()
    }
    async checkUserExist(username, email) {
        try {
            const query = 'SELECT COUNT(*) as count FROM USER WHERE username = ? OR email = ?';
            const results = await this.dbInstance.hitQuery(query, [username, email]);
            const count = results[0].count;
            return count > 0? true: false;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async checkUserExistById(userId) {
        try {
            const query = 'SELECT COUNT(*) as count FROM USER WHERE userId = ?';
            const results = await this.dbInstance.hitQuery(query, [userId]);
            const count = results[0].count;
            return count > 0? true: false;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getUserById(userId) {
        try {
        const query = 'SELECT * FROM USER WHERE userId = ?';
        const results = await this.dbInstance.hitQuery(query, [userId]);
        if(results.length !=1)
        {
            throw new Error (`More than one user has same id ${userId}`)
        }
        else
        {
            return results[0]
        }
        } catch (error) {
        console.log(error)
        return null
        }
    }

    async getBasicUserDataById(userId) {
        try {
        const query = `SELECT U.userId, U.userName, I.imageUrl
                       FROM USER U
                       LEFT JOIN IMAGE I ON U.userId = I.userId AND I.topic='avatar'\
                       WHERE U.userId = ?`
        const results = await this.dbInstance.hitQuery(query, [userId]);
        if(results.length !=1)
        {
            throw new Error (`Some thing wrong related to userData`)
        }
        else
        {
            return results[0]
        }
        } catch (error) {
        console.log(error)
        return null
        }
    }

    async getUserFromMail(email) {
        try {
        const query = 'SELECT * FROM USER WHERE email = ?';
        const results = await this.dbInstance.hitQuery(query, [email]);
        if(results.length !=1)
        {
            throw new Error (`More than one user use ${email}`)
        }
        else
        {
            return results[0]
        }
        } catch (error) {
        console.log(error)
        return null
        }
    }

    async getUserName(username)
    {
        try {
            const query = 'SELECT * FROM USER WHERE username = ? ';
            const result = await this.dbInstance.hitQuery(query, [username]);
            return result.length != 0? result[0]: null;
        }
        catch (error) {
            console.log(username)
            return null
        }
    }

    async updatePassword(newPassword, userId) {
        try {
        const query = 'UPDATE USER set password = ? WHERE userId = ?';
        await this.dbInstance.hitQuery(query, [newPassword, userId]);
        return userId;
        } catch (error) {
        console.error(error);
        return null;
        }
    }

    // adding user to database
    async addUser(username, email, password, birthDay) {
        // we have 2 query, first for inserting, the second for getting the lastest id that
        // was inserted
        const query = 'INSERT INTO USER (userId, userName, email, password, birthDay) VALUES (UUID(), ?, ?, ?, ?)';
        await this.dbInstance.hitQuery(query, [username, email, password, birthDay]);
        const newUser = await this.getUserFromMail(email)
        return newUser.userId
    }

    async updateUserProfile(queriesData, userId)
    {
        const {query, queryParams, emailChange} =  SqlBuilder.dynamicSqlForUpdateUserByUserId(queriesData, userId)
        await this.dbInstance.hitQuery(query, queryParams)
        if(emailChange)
        {
            this.updateVerifiedStatus(false, userId)
        }
        return await this.getUserById(userId)
    }

    async deleteUser(userId)
    {
      const query = 'DELETE FROM USER WHERE userId = ?'
      const result = await this.dbInstance.hitQuery(query, [userId]);
      console.log(result)
      return result
    } 

    async updateVerifiedStatus(status, userId)
    {
        const query = 'UPDATE USER SET verified = ? WHERE userId = ?'
        const result = await this.dbInstance.hitQuery(query, [status, userId]);
    }
}

module.exports = new UserQuery()