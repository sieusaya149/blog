const instanceMySqlDB = require('./init.mysql');
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
}

module.exports = new UserQuery()