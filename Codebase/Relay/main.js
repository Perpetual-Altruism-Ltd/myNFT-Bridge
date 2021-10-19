"use strict;"

const Conf = require('./conf')
const Express = require('express')
const Logger = require('./libs/winston')('Main')
const Client = require('./libs/client')
const JoiSchemas = require('./libs/joiSchemas')

const clientList = {}

const app = Express()

app.use(Express.json())

app.get('/register', (req, res) => {
    const client = new Client()
    clientList[client.id] = client

    res.send({
        id: client.id
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