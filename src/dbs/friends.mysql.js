const instanceMySqlDB = require('./init.mysql');
const UserQuery = require('./user.mysql')
const { BadRequestError } = require('../core/error.response');
class FriendQuery {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }

    async insertNewFriendRequest(requesterId, recipientId, status = "Pending")
    {
        const query = 'INSERT INTO FRIEND_REQUESTS (requestId, requesterId, recipientId, status)\
                        VALUES (UUID(), ?, ?, ?)';
        try {
            const insertResult = await this.dbInstance.executeQueryV2(query, [requesterId, recipientId, status]);
            if(insertResult.affectedRows != 1)
            {
                throw new Error("Insert new friend request failed")
            }
        }
        catch (error) {
            throw new BadRequestError("Some thing went wrong when making friend request")
        }
    }

    async updateFriendRequest(requesterId, recipientId, status)
    {
        if(status == 'Accepted' || status == 'Rejected' || status == 'Pending')
        {
            const query = "UPDATE FRIEND_REQUESTS set status = ? where requesterId = ? and recipientId = ?"
            await this.dbInstance.executeQueryV2(query, [status, requesterId, recipientId])
        }
        else
        {
            throw new BadRequestError("The status does not expectation, should be (Accepted ,Rejected or Pending)")
        }
    }

    async getAllFriendRequestsByStatus(recipientId, status = null)
    {
        let query = 'SELECT * FROM FRIEND_REQUESTS where recipientId = ?';
        let listParams = [recipientId]
        if(status)
        {
            query = query +  "and status = ?"
            listParams.push(status)
        }
        try {
            const listFriendRequest = await this.dbInstance.executeQueryV2(query, listParams);
            return listFriendRequest
        }
        catch (error) {
            throw new BadRequestError("Some thing went wrong when making friend request")
        }
    }

    async upsertNewFriendRequest(requesterId, recipientId, status = 'Pending') {
        const isRequesterExist  = await UserQuery.checkUserExistById(requesterId)
        const isRecipientExist  = await UserQuery.checkUserExistById(recipientId)

        if(!isRequesterExist || !isRecipientExist)
        {
            throw new BadRequestError("There are some wrong related the existance of user")
        }

        const friendshipExistence = await this.checkIfTheyAreFriend(requesterId, recipientId)
        if(friendshipExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }

        const friendRequestExistence = await this.isFriendRequestExist(requesterId, recipientId)
        if(friendRequestExistence)
        {
            console.log("UPDATE existing friend request")
            await this.updateFriendRequest(requesterId, recipientId, status)
        }
        else
        {
            console.log("INSERT new friend request")
            await this.insertNewFriendRequest(requesterId, recipientId)
        }
    }

    async isFriendRequestExist(requesterId, recipientId)
    {
        const query = "SELECT COUNT(*) FROM FRIEND_REQUESTS WHERE requesterId = ? AND recipientId = ?";
        const result = await this.dbInstance.executeQueryV2(query, [requesterId, recipientId]);
        return result[0]?.['COUNT(*)'] == 1
    }

    async getStatusOfFriendRequest(requesterId, recipientId)
    {
        const query = "SELECT status FROM FRIEND_REQUESTS WHERE requesterId = ? AND recipientId = ?";
        const result = await this.dbInstance.executeQueryV2(query, [requesterId, recipientId]);
        return result[0]?.['status']
    }

    async addNewFriendShip(userAId, userBId)
    {
        const friendlyExistence = await this.checkIfTheyAreFriend(userAId, userBId)
        if(friendlyExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }

        const query = `
        INSERT INTO FRIENDSHIPS (friendshipId, userAId, userBId)
        VALUES (UUID(), ?, ?),
               (UUID(), ?, ?)`;

        await this.dbInstance.executeQueryV2(query, [userAId, userBId, userBId, userAId]);
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