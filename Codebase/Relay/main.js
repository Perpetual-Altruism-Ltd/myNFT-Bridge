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

app.post('/getAvailableTokenId', async (req, res) => {
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
    const { migrationData } = req.body
    const originUniverse = Conf.universes.find(universe => universe.uniqueId == migrationData.originUniverse)
    if(!originUniverse) 
        throw "Can't find origin universe"
    const destinationUniverse = Conf.universes.find(universe => universe.uniqueId == migrationData.destinationUniverse)
    if(!destinationUniverse) 
        throw "Can't find destination universe"


    // Returning migration_id
    const client = new Client(
        migrationData,  
        originUniverse,
        destinationUniverse,
        db
    )
    clientList[client.id] = client
    res.json({
        migrationId: client.id
    })

    // Calling departure bridge
    await client.annonceToBridge(originUniverse)
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
    res.json({
        status: "No migration hash yet"
    })
})

app.post('/continueMigration', async (req, res) => {
    const { error } = JoiSchemas.continueMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /continueMigration" })
        Logger.error("Bad parameters given to /continueMigration")
        return
    }
    const client = clientList[req.body.migrationId]
    if(!client) {
        return res.status(400).json({ error : 'Unknown migrationId' })
    }

    try{
        res.status(200).send({
            status: "Migration continuing."
        })

        // Transferring token to departure bridge
        await client.transferToBridge(req.body.migrationHashSignature)

        // Update escrow hash
        await client.updateEscrowHash()
    }catch(err){
        res.status(500).send({
            error: "Unexpected error on the server."
        })
        Logger.error(err)
    }
})

app.post('/pollingEscrow', (req, res) => {
    const { error } = JoiSchemas.pollingEscrow.validate(req.body)
    if(error) {
        res.status(400)
        res.send({ status: "Bad parameters given to /pollingEscrow" })
        Logger.error("Bad parameters given to /pollingEscrow")
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
    res.json({
        status: "No escrow hash yet"
    })
})

app.post('/closeMigration', async (req, res) => {
    const { error } = JoiSchemas.closeMigration.validate(req.body)
    if(error){
        res.status(400)
        res.send({ status: "Bad parameters given to /closeMigration" })
        Logger.error("Bad parameters given to /closeMigration")
        return
    }
    const client = clientList[req.body.migrationId]
    if(!client) {
        return res.status(400).json({ error : 'Unknown migrationId' })
    }

    try{
        res.status(200).send({
            "status": "Minting of the token initiated"
        })
        // Check if escrow hash is valid before doing anything
        await client.verifyEscrowHashSigned(req.body.escrowHashSignature)

        //call client which will call ethereum on destination which will call migrateFromIOUERC721ToERC721 on bridge
        await client.closeMigration()

        // Call origin bridge migrateFromIOUERC721ToERC721
        await client.registerTransferOnOriginBridge(req.body.escrowHashSignature)
    }catch(err){
        res.status(500).send({
            error: "Unexpected error on the server."
        })
        Logger.error(err)
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

app.listen(Conf.port, () => {
    Logger.info(`Web server listening on port ${Conf.port}`)
})

