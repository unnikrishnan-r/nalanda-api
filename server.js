require("dotenv").config();
var express = require("express");
// var morgan = require('morgan')



var db = require("./database/models");

const routes = require("./routes");
var cors = require('cors');

const app = express();
// app.use(morgan('tiny'))
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Serve up static assets (usually on heroku)ß
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Routes
app.use(routes, cors());
// CORS header `Access-Control-Allow-Origin` set to accept all
app.get('/', function(request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Origin', '*');
  response.sendFile(__dirname + '/message.json');
});


var syncOptions = {};
console.log(process.env.SYNC_MODEL)
syncOptions.force = process.env.SYNC_MODEL === "true" ? true : false;

// Starting the server, syncing our models ------------------------------------/
db.sequelizeConnection.sync(syncOptions).then(function () {
  app.listen(PORT, function () {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
