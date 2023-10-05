const QueryBase = require('./queryBase')
const { v4: uuidv4 } = require('uuid');
class SaveListQuery extends QueryBase{
    constructor()
    {
        super()
    }
    async createNewSaveList(saveListId, nameList, userId)
    {
        const query = `INSERT INTO SAVELIST (saveListId, nameSaveList, userId) VALUES 
                        (?, ?, ?)`
        await this.dbInstance.hitQuery(query, [saveListId, nameList, userId])
    }

    async getSaveList(nameList, userId)
    {
        const query = `SELECT * FROM SAVELIST WHERE nameSaveList = ? AND userId = ?`
        const existingSaveList = await this.dbInstance.hitQuery(query, [nameList, userId])
        if(existingSaveList.length == 1)
        {
            return existingSaveList[0]
        }
        else if(existingSaveList.length > 1)
        {
            throw new Error("There are two savelist has same name")
        }
        else
        {
            return null
        }
    }

}
class SavePostQuery extends QueryBase{
    constructor()
    {
        super()
        this.saveListQuery = new SaveListQuery()
    }
    async getPostFromSaveList(savelistId, postId)
    {
        const query = `SELECT * FROM SAVELIST_POST WHERE saveListId = ? AND postId = ?`
        const existingSavePost = await this.dbInstance.hitQuery(query, [savelistId, postId])
        if(existingSavePost.length != 0)
        {
            return existingSavePost
        }
        else
        {
            return null
        }
    }

    async getPostsBySavelistId(savelistId)
    {
        const query = `SELECT postId, created_at, updated_at FROM SAVELIST_POST WHERE saveListId = ?`
        const existingSavePost = await this.dbInstance.hitQuery(query, [savelistId])
        return existingSavePost
    }

    async saveNewPost(userId, nameList, postId)
    {
        // check if the nameList is existing or not, if not create new
        const existingSaveList = await this.saveListQuery.getSaveList(nameList, userId)
        let saveListId = null
        if(!existingSaveList)
        {
            saveListId = uuidv4();
            console.log(`DEBUG: create new SaveList ${nameList} with id ${saveListId}`)
            await this.saveListQuery.createNewSaveList(saveListId, nameList, userId)
        }
        else
        {
            saveListId = existingSaveList.saveListId
            console.log(`DEBUG: SaveList ${nameList} existed with id ${saveListId}`)
        }
        // in each savelist has only one postId
        if(! await this.getPostFromSaveList(saveListId, postId))
        {
            const saveListPostId = uuidv4()
            const query = `INSERT INTO SAVELIST_POST (saveListPostId, saveListId, postId)
                           VALUES (?, ?, ?)`
            await this.dbInstance.hitQuery(query, [saveListPostId, saveListId, postId])
        }
        else
        {
            console.warn(`The post ${postId} was saved in ${saveListId} already`)
        }
    }

    async unsavePost(userId, nameList, postId)
    {
        // check if the nameList is existing or not, if not create new
        const existingSaveList = await this.saveListQuery.getSaveList(nameList, userId)
        if(!existingSaveList)
        {
            throw new Error(`The saveList ${nameList} does not exist`)
        }
        const saveListId = existingSaveList.saveListId
        if(! await this.getPostFromSaveList(saveListId, postId))
        {
            console.log(`The post ${postId} was does not exist in savelist ${nameList}`)
            return null
        }
        const query = `DELETE FROM SAVELIST_POST WHERE postId = ? AND saveListId = ?`
        const deteleResult = await this.dbInstance.hitQuery(query, [postId, saveListId])
        return deteleResult
    }

    async getSavedPost(nameList, userId)
    {
        const existingSaveList = await this.saveListQuery.getSaveList(nameList, userId)
        let savePosts = []
        if(!existingSaveList)
        {
            return {savePosts}
        }
        savePosts = await this.getPostsBySavelistId(existingSaveList.saveListId)
        return {savePosts}
    }
}

module.exports = {SaveListQuery, SavePostQuery}