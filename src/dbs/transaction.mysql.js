const instanceMySqlDB = require('./init.mysql');
const QueryBase = require('./queryBase');
class TransactionQuery extends QueryBase {
    constructor()
    {
        super()        
    }
    async startTransaction() {
        try {
            const query = 'START TRANSACTION;';
            const results = await this.dbInstance.hitQuery(query);
            console.log("START TRANSACTION")
        } catch (error) {
            console.log(error)
            throw new Error("Issue Happen when start transaction")
        }
    }

    async rollBackTransaction() {
        try {
            const query = 'ROLLBACK;';
            const results = await this.dbInstance.hitQuery(query);
            console.log("ROLLBACK TRANSACTION")
        } catch (error) {
            throw new Error("Issue Happen when rollback transaction")
        }
    }

    async commitTransaction()
    {
        try {
            const query = 'COMMIT;';
            const results = await this.dbInstance.hitQuery(query);
            console.log("COMMIT TRANSACTION")
          } catch (error) {
            throw new Error("Issue Happen when commit transaction")
          }
    }
}

module.exports = new TransactionQuery()
