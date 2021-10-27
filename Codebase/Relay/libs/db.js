const Loki = require('lokijs')

class Db {
    constructor(){}

    init(){
        return new Promise((resolve, reject) => {
            const autoloadCallback = () => {
                this.collections = {
                    premintedTokens: (this.instance.getCollection('premintedTokens') === null) ? this.instance.addCollection('premintedTokens') : this.instance.getCollection('premintedTokens'),
                    mintedIOU: (this.instance.getCollection('mintedIOU') === null) ? this.instance.addCollection('mintedIOU') : this.instance.getCollection('mintedIOU'),
                    clients: (this.instance.getCollection('clients') === null) ? this.instance.addCollection('clients') : this.instance.getCollection('clients')
                }
                resolve()
            }

            this.instance = new Loki('db.json', { 
                autosave: true
                , autosaveInterval: 100
                , autoload: true
                , autoloadCallback: autoloadCallback 
            })
        })
    }
}

module.exports = Db