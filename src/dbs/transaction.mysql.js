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
            throw new Error("Issue Happen when start transaction")
        }
    }

    async rollBackTransaction() {
        try {
            const query = 'ROLLBACK';
            const results = this.dbInstance.executeQuery(query);
            console.log(results.sql)
        } catch (error) {
            throw new Error("Issue Happen when rollback transaction")
        }
    }

    async commitTransaction()
    {
        try {
            const query = 'COMMIT';
            const results = this.dbInstance.executeQuery(query);
            console.log(results.sql)

          } catch (error) {
            throw new Error("Issue Happen when commit transaction")
          }
    }
}

module.exports = new TransactionQuery()
