
const path=require('path');
const express = require("express");
const roomController = require("./controller/roomController");

exports.createRoutes = function(app){

    app.use('/', express.static('public'));
    
    app.use('/assets', express.static('assets'));

    // google web master server ownership proof
    app.get('/googleeedf3d735bfba695.html', function(req, res) {
      res.sendFile(path.join(__dirname + '/assets/googleeedf3d735bfba695.html'));
    });
    
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
}