// Colyseus + Express
const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const bingoRoom = require("./rooms/bingoRoom").room;
const mainRoom = require("./rooms/mainRoom").room;

const port = process.env.PORT || 80;

const app = express();
app.use(express.json());

app.use('/', express.static('public'));
app.use('/room/:roomId', express.static('public'));
app.use('/room/:roomId/:clientId', express.static('public'));
app.get('*', function(req, res) {
  res.redirect('/');
});

const gameServer = new colyseus.Server({
  server: http.createServer(app),
  express: app
});

// register your room handlers
gameServer.define("bingoRoom", bingoRoom);
gameServer.define("mainRoom", mainRoom);

gameServer.listen(port);

console.log("Bingo server on port:" + port);
