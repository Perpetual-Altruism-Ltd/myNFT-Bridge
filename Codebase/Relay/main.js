"use strict;"

const Conf = require('./conf')
const Express = require('express')
const Logger = require('./libs/winston')('Main')
const Client = require('./libs/client')
const Ethereum = require('./libs/blockhainModules/ethereum')
const JoiSchemas = require('./libs/joiSchemas')
const Db = require('./libs/db')
const { sleep } = require('./libs/utils')


const db = new Db()
const clientList = {}

function premintStock(){
    Conf.universes.forEach(universe => {
        const ethereum = new Ethereum(universe.rpc)
        universe.worlds.forEach(async world => {
            while(true){
                await sleep(1000)
                const premintedTokens = db.dbCollections.premintedTokens.find({ universe: universe.uniqueId, world: world.address, used: false })
                if(premintedTokens.length < 2){
                    const tokenId = await ethereum.premintToken(world.address)
                    db.dbCollections.premintedTokens.insert({ 
                        tokenId, 
                        universe: universe.uniqueId, 
                        world: world.address,
                        used: false
                    })
                }
            }
        })
    })
}

premintStock()

const app = Express()

app.use(Express.json())

app.get('/register', (req, res) => {
    const client = new Client()
    clientList[client.id] = client

    res.send({
        id: client.id
    })
})

app.post('/getAvailableWorlds', (req, res) => {
    const { error } = JoiSchemas.getAvailableWorlds.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /getAvailableWorlds" })
        Logger.error("Bad parameters given to /getAvailableWorlds")
        return
    }

    const universe = Conf.universes.find(universe => universe.uniqueId == req.body.universe)
    if(universe) {
        const addresses = universe.worlds.map(elt => elt.address);
        return res.json({
            "worlds" : addresses
        });
    }
    return res.status(400).json({ error : 'Universe Not Found' });
})

app.get('/getAvailableTokenId', async (req, res) => {
    const { error } = JoiSchemas.getAvailableTokenId.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /getAvailableTokenId" })
        Logger.error("Bad parameters given to /getAvailableTokenId")
        return
    }

    const universe = Conf.universes.find(universe => universe.uniqueId == req.body.universe)

    const premintedTokens = db.dbCollections.premintedTokens.find({ universe: universe.uniqueId, world: req.body.world, used: false })

    const ethereum = new Ethereum(universe.rpc)

    if(premintedTokens.length === 0){
        const tokenId = await ethereum.premintToken(req.body.universe, req.body.world)
        db.dbCollections.premintedTokens.insert({ 
            tokenId, 
            universe: universe.uniqueId, 
            world: req.body.world,
            used: true
        })
    }else{
        const token = premintedTokens[0].tokenId
        premintedTokens[0].used = true
        db.dbCollections.premintedTokens.update(premintedToken[0])
    }

    res.json({ "tokenId" : token })
})

app.post('/initMigration', async (req, res) => {
    const { error } = JoiSchemas.initMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /initMigration" })
        Logger.error("Bad parameters given to /initMigration")
        return
    }
    const { migrationData, migrationSignature } = req.body
    const originUniverse = Conf.universes.find(universe => universe.uniqueId == migrationData.originUniverse)
    if(!originUniverse) {
        throw "Can't find this universe"
    }

    // Returning migration_id
    const client = new Client(
        migrationData, 
        migrationSignature, 
        originUniverse
    )
    clientList[client.id] = client
    res.json({
        migrationId: client.id
    })

    // Calling departure bridge
    await client.annonceToBridge(originUniverse)

    // Transferring token to departure bridge
    await client.transferToBridge(originUniverse)
})

// TODO : add this function/endpoint to the documentation (step n°18)
app.post('/pollingMigration', (req, res) => {
    const { error } = JoiSchemas.pollingMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /pollingMigration" })
        Logger.error("Bad parameters given to /pollingMigration")
        return
    }
    const client = clientList[req.body.migrationId]
    if(!client) {
        return res.status(400).json({ error : 'Unknown migrationId' })
    }
    if(client.migrationHash) {
        return res.json({
            migrationHash: client.migrationHash
        })
    }
})

app.post('/pollingEscrow', (req, res) => {
    const { error } = JoiSchemas.pollingMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /pollingMigration" })
        Logger.error("Bad parameters given to /pollingMigration")
        return
    }
    const client = clientList[req.body.migrationId];
    if(!client) {
        return res.status(400).json({ error : 'Unknown migrationId' })
    }
    if(client.escrowHash) {
        return res.json({
            escrowHash: client.escrowHash
        })
    }
})

app.post('/closeMigration', async (req, res) => {
    const { error } = JoiSchemas.closeMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /closeMigration" })
        Logger.error("Bad parameters given to /closeMigration")
        return
    }
})

app.post('/pollingEndMigration', (req, res) => {
    const { error } = JoiSchemas.pollingEndMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /pollingEndMigration" })
        Logger.error("Bad parameters given to /pollingEndMigration")
        return
    }
    const client = clientList[req.body.migrationId]
    if(!client) {
        return res.status(400).json({ error : 'Unknown migrationId' })
    }
    if(client.creationTransferHash) {
        return res.json({
            "migrationStatus":"Ok",
            "transactionHash": client.creationTransferHash
        })
    }
    return res.json({
        "migrationStatus":"Running"
    })
})

app.get('/getMigrationPaths', (req, res) => {
    res.send(Conf.migrationPaths)
})

app.get('/getUniverses', (req, res) => {
    res.send(Conf.universes)
})

app.post('/getContracts', (req, res) => {
    const { error } = JoiSchemas.getContracts.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /getContracts" })
        Logger.error("Bad parameters given to /getContracts")
        return
    }

    const universe = Conf.universes.find(universe => universe.uniqueId == req.body.universeUniqueId)
    if(!universe){
        res.status(404)
        res.send({ "status": "Universe not found" })
        Logger.error(`Universe ${req.body.universeUniqueId} not found`)
        return
    }

    res.send(universe.contracts)
})

app.post('/waitForOperatorElevation', (req, res) => {
    const { error } = JoiSchemas.waitForOperatorElevation.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /waitForOperatorElevation" })
        Logger.error("Bad parameters given to /waitForOperatorElevation")
        return
    }

    const client = clientList[req.body.clientId]

    if(!client){
        res.status(404)
        res.send({ status: "Client does not exist" })
        return
    }

    const universe = Conf.universes.find(universe => universe.uniqueId == req.body.universeUniqueId)
    if(!universe){
        res.status(404)
        res.send({ "status": "Universe not found" })
        Logger.error(`Universe ${req.body.universeUniqueId} not found`)
        return
    }

    client.waitForApproval(universe, req.body.contract, req.body.tokenId)

    res.send({ status: "Waiting for approval" })
})

app.listen(Conf.port, () => {
    Logger.info(`Web server listening on port ${Conf.port}`)
})


