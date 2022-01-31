"use strict;"

const Express = require('express')
const Cors = require('cors')
const Conf = require('./conf')

const app = Express()

app.use(Cors())

app.use(Express.static('public'))

app.use('/conf', function(req,res){res.send(Conf);});

app.use(function(req, res, next) {
    res.sendFile('index.html', {root: 'public'});
});

app.listen(Conf.port, () => {
    console.log(`Web server listening on port ${Conf.port}`)
})
