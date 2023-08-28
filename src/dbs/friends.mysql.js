const instanceMySqlDB = require('./init.mysql');
const UserQuery = require('./user.mysql')
const { BadRequestError } = require('../core/error.response');
class FriendQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }

    async addNewFriendRequest(requesterId, recipientId) {
        const isRequesterExist  = await UserQuery.checkUserExistById(requesterId)
        const isRecipientExist  = await UserQuery.checkUserExistById(recipientId)

        if(!isRequesterExist || !isRecipientExist)
        {
            throw new BadRequestError("There are some wrong related the existance of user")
        }

        const friendlyExistence = await this.checkIfTheyAreFriend(requesterId, recipientId)
        if(friendlyExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }

        const query = 'INSERT INTO FRIEND_REQUESTS (requestId, requesterId, recipientId)\
                        VALUES (UUID(), ?, ?)';
        try {
            const insertResult = await this.dbInstance.executeQueryV2(query, [requesterId, recipientId]);
            if(insertResult.affectedRows != 1)
            {
                throw new Error("Insert new friend request failed")
            }
        } catch (error) {
            throw new BadRequestError("Some thing went wrong when making friend request")
        }
    }

    async checkIfTheyAreFriend(requesterId, recipientId)
    {
        const query = "SELECT COUNT(*) FROM FRIENDSHIPS\
                       WHERE userAId = ? and userBId = ?";
        const result = await this.dbInstance.executeQueryV2(query, [requesterId, recipientId]);
        return result[0]?.['COUNT(*)'] == 1
    
    }
}

module.exports = new FriendQuery()