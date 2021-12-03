const Logger = require('./winston.js')('Saruman')
const Conf = require('../conf')
const Axios = require('axios')

class Saruman {
    constructor(){}

    async createScreenshot(videoUrl){
        const result = await Axios.post(
            `${Conf.sarumanUrl}/screenshots/createScreenshot`, 
            {
                videoUrl
            }
        )

        return result.data
    }
}

module.exports = Saruman