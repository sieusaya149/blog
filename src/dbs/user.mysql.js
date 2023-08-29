const instanceMySqlDB = require('./init.mysql');
const SqlBuilder = require('../utils/sqlBuilder')
class UserQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
    async checkUserExist(username, email) {
        try {
            const query = 'SELECT COUNT(*) as count FROM USER WHERE username = ? OR email = ?';
            const results = await this.dbInstance.executeQueryV2(query, [username, email]);
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
            const results = await this.dbInstance.executeQueryV2(query, [userId]);
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
        const results = await this.dbInstance.executeQueryV2(query, [userId]);
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
        const query = `SELECT U.userName, U.email, I.imageUrl
                       FROM USER U
                       LEFT JOIN IMAGE I ON U.userId = I.userId AND I.topic='avatar'\
                       WHERE U.userId = ?`
        const results = await this.dbInstance.executeQueryV2(query, [userId]);
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
        const results = await this.dbInstance.executeQueryV2(query, [email]);
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
            const result = await this.dbInstance.executeQueryV2(query, [username]);
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
        await this.dbInstance.executeQueryV2(query, [newPassword, userId]);
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
        await this.dbInstance.executeQueryV2(query, [username, email, password, birthDay]);
        const newUser = await this.getUserFromMail(email)
        return newUser.userId
    }

    async updateUserProfile(queriesData, userId)
    {
        const {query, queryParams, emailChange} =  SqlBuilder.dynamicSqlForUpdateUserByUserId(queriesData, userId)
        await this.dbInstance.executeQueryV2(query, queryParams)
        if(emailChange)
        {
            this.updateVerifiedStatus(false, userId)
        }
        return await this.getUserById(userId)
    }

    async deleteUser(userId)
    {
      const query = 'DELETE FROM USER WHERE userId = ?'
      const result = await this.dbInstance.executeQueryV2(query, [userId]);
      console.log(result)
      return result
    } 

    async updateVerifiedStatus(status, userId)
    {
        const query = 'UPDATE USER SET verified = ? WHERE userId = ?'
        const result = await this.dbInstance.executeQueryV2(query, [status, userId]);
    }
}

module.exports = new UserQuery()