// Colyseus + Express
const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const bingoRoom = require("./rooms/bingoRoom").room;
const mainRoom = require("./rooms/mainRoom").room;

const port = process.env.port || 6061;
console.log(process.env.port);
const app = express();
app.use(express.json());

const gameServer = new colyseus.Server({
  server: http.createServer(app),
  express: app
});

// register your room handlers
gameServer.define("bingoRoom", bingoRoom);
gameServer.define("mainRoom", mainRoom);

gameServer.listen(port);

console.log("Bingo server on port:" + port);
