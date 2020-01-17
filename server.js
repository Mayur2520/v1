
	var dbcreation = require('./lib/config/dbCreation');
	
var express = require('express'),
	path = require('path'),
	bodypareser = require('body-parser'),
	fs = require('fs'),
	morgan = require('morgan');
	// logger = require('./lib/config/logger'),
	var loggerConf = require('./lib/config/loggerConfig');

	var cors = require("cors")


	var routes = require('./lib/routes');

	var app = express();

	let http = require('http').Server(app);

	app.use(cors());

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
 
app.use(bodypareser.urlencoded({limit:'20mb',extended:true}));
app.use(bodypareser.json({limit:'20mb'}));
	
app.use(express.static(path.join(__dirname,'app')));

routes.configure(app);

dbcreation.createDB();
dbcreation.CreateTables();



var server = app.listen(parseInt(8029),function(){
	console.log('server start on '+ server.address().port+ ' port');
})	

	// Socket setting
	/* let io = require('socket.io')(server);
	require('./lib/config/socket.Ctrl')(io); */
	// Socket setting

	
app.use(morgan('tiny', {
    stream: loggerConf.stream
})); 

