var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/chat';
var assert = require('assert');

var mongo = null;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  mongo = db;
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/hist', function(req, res){
  var collection = mongo.collection('chat');
  collection.find({}).sort({_id:-1}).limit(5).toArray(function(err, docs) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(docs));
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('message', function(msg) {
    console.log(msg.u + ' sent \"' + msg.m + '\"');
    io.emit('propMessage', msg);
    var collection = mongo.collection('chat');
    collection.insert(msg, function (result) {
      console.log(result);
    });
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
