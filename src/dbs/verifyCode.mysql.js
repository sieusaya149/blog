const instanceMySqlDB = require('./init.mysql');
const { v4: uuidv4 } = require('uuid');

class VerifyCodeQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
    async checkCodeForUserExist(userId)
    {
        try {
            const query = 'SELECT * FROM VERIFYCODE WHERE userId = ? '
            const results = await this.dbInstance.executeQueryV2(query, [userId]);
            if(results.length >= 1)
            {
                return results[0]
            }
            else
            {
                return null
            }
          } catch (error) {
            console.log(error)
            return null
          }
    }

    async checkCodeExistOrNot(code, userId)
    {
        try {
            const query = 'SELECT *  FROM VERIFYCODE WHERE code = ? AND userId = ? '
            const results = await this.dbInstance.executeQueryV2(query, [code, userId]);
            if(results.length == 1)
            {
              return results[0]
            }
            else
            {
              throw new Error("The verify code does not match")
            }
          } catch (error) {
            console.log(error)
            return null
          }
    }
    async createNewVerifyCode(code, expireTime , userId) {
        try {
            // check if the userid exist in db or not
            var query = ""
            var codeId = uuidv4();
            const expireDate = new Date(expireTime);
            const existingCode = await this.checkCodeForUserExist(userId)
            if(existingCode)
            {
                codeId = existingCode.codeId
                query = 'UPDATE VERIFYCODE SET code = ? , expireTime = ? \
                         WHERE codeId = ?';
                await this.dbInstance.executeQueryV2(query, [code, expireDate, codeId]);
            }
            else
            {
                query = 'INSERT INTO VERIFYCODE (codeId, code, expireTime, userId) \
                VALUES (UUID(), ?, ?, ?)';
                await this.dbInstance.executeQueryV2(query, [code, expireDate, userId]);
            }

            const verifyCodeSql = 'SELECT * FROM VERIFYCODE WHERE userId = ?';
            const verifyCode = await this.dbInstance.executeQueryV2(verifyCodeSql, [userId]);
            console.log(verifyCode)
            return verifyCode;
          }
          catch (error) {
            console.log(error)
            return null
          }
    }

    async deleteVerifyCode(code, userId)
    {
      if(await this.checkCodeExistOrNot(code,userId) == null)
      {
        throw new Error("The code does not exist")
      }
      const query = 'DELETE FROM VERIFYCODE WHERE code = ? AND userId = ? '
      const results = await this.dbInstance.executeQueryV2(query, [code, userId]);
      if(results.affectedRows == 1) 
      {
        return true
      }
      else
      {
        return false
      }
    }
}

module.exports = new VerifyCodeQuery()