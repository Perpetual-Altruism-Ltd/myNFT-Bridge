const Loki = require('lokijs')

class Db {
    constructor(){
        this.dbInstance = new Loki('db', { autoload: true })
        this.dbCollections = {
            mintedIOU: (this.dbInstance.getCollection('mintedIOU') === null) ? this.dbInstance.addCollection('mintedIOU') : this.dbInstance.getCollection('mintedIOU')
        }
    }
}

module.exports = Db