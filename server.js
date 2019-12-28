// Colyseus + Express
const colyseus = require("colyseus");
const MongooseDriver = require("colyseus/lib/matchmaker/drivers/MongooseDriver").MongooseDriver;
const http = require("http");
const cors = require("cors");
const express = require("express");
const bingoRoom = require("./rooms/bingoRoom").room;
const mainRoom = require("./rooms/mainRoom").room;
const roomController = require("./controller/roomController");
const { config } = require("./config");

const port = process.env.NODE_ENV == 'development'? 6061:8080;

const app = express();
app.use(express.json());

if(process.env.NODE_ENV == 'development'){
  app.use(cors());
}else{
  // app.use(cors({origin: 'https://www.vubingo.com'}));
  app.use(cors());
}

roomController.clearRoomAliases();

app.use('/', express.static('public'));
app.use('/assets', express.static('assets'));
app.use('/getRoomAlias',  function(req, res) {
  roomController.getRoomAlias(req,res);
});
app.use('/getRoomIdFromAlias',  function(req, res) {
  roomController.getRoomIdFromAlias(req,res);
});
app.use('/room/:roomId', express.static('public'));
app.use('/room/:roomId/:clientId', express.static('public'));
app.get('*', function(req, res) {
  res.redirect('/');
});

const gameServer = new colyseus.Server({
  server: http.createServer(app),
  express: app,
  driver: new MongooseDriver(config.mongoDbUri)
});

// register your room handlers
gameServer.define("bingoRoom", bingoRoom);
gameServer.define("mainRoom", mainRoom);

gameServer.listen(port);

console.log("Bingo server on port:" + port);
