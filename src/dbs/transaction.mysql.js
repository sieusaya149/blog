const instanceMySqlDB = require('./init.mysql');
class TransactionQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
    async startTransaction() {
        try {
            const query = 'START TRANSACTION';
            const results = this.dbInstance.executeQuery(query);
            console.log(results.sql)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async rollBackTransaction() {
        try {
            const query = 'ROLLBACK';
            const results = this.dbInstance.executeQuery(query);
            console.log(results.sql)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async commitTransaction()
    {
        try {
            const query = 'COMMIT';
            const results = this.dbInstance.executeQuery(query);
            console.log(results.sql)

          } catch (error) {
            console.log(error)
            return null
          }
    }
}

module.exports = new TransactionQuery()
