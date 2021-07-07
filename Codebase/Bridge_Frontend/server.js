//===================== Settings =====================
var conf = require('./conf');


//===================== Logs =====================
logger = require('./src/engine/gear/logger.js').logger;

//===================== Init of express =====================
let express = require('express');
let app = express();
app.enable('trust proxy');

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

app.use(require("morgan")("combined", {
        "stream": logger.stream
    }));

//Compression
var compression = require('compression');
app.use(compression());

let path = require('path');
app.set('views', path.join(__dirname, 'src/engine/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//==========================================================
//===================== Request Pre-Processing =============
//==========================================================

var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
        extended: true
    }));

// parse application/json
app.use(bodyParser.json());

var cookieParser = require('cookie-parser');
app.use(cookieParser());

//==========================================================
//========================== Routing =======================
//==========================================================

var routes = require('./src/engine/index');
app.use('/', routes);

app.set('port', process.env.PORT || 85);

var server = app.listen(app.get('port'), function () {
        logger.info('server.js: Express server listening on port ' + server.address().port);
    });