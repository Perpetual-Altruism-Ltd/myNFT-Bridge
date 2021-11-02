//===================== Init of express =====================
let path = require('path');
let compression = require('compression');
let express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
let app = express();
app.enable('trust proxy');

//Compression
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

//==========================================================
//===================== Request Pre-Processing =============
//==========================================================

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
        extended: true
    }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser());

//==========================================================
//========================== Routing =======================
//==========================================================

/* Redirect all routes to our "index.html" file */
app.get("/*", (req, res) => {
  res.sendFile(path.resolve("public/site/static_views", "index.html"));
});


const port = process.env.PORT || 85;

var server = app.listen(port, function () {
        console.log("Server listening on port: " + port);
});
