"use strict;"

const Express = require('express')
const Cors = require('cors')

const app = Express()

app.use(Cors())

app.use(Express.static('public'))

app.use(function(req, res, next) {
    res.sendFile('index.html', {root: 'public'});
});

app.listen(8080, () => {
    console.log(`Web server listening on port 8080`)
})