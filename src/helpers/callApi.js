const axios = require('axios');

const getApi  = async (url) =>
{
    console.log('start call api')
    try {
        const result = await axios.get(url)
        console.log(result)
        return result.data
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = {getApi}