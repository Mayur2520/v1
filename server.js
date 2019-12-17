var express = require('express'),
	path = require('path'),
	bodypareser = require('body-parser'),
	fs = require('fs'),
	morgan = require('morgan');
	// logger = require('./lib/config/logger'),
	var loggerConf = require('./lib/config/loggerConfig');
	var dbcreation = require('./lib/config/dbCreation');
	


	var routes = require('./lib/routes');

	var app = express();

	let http = require('http').Server(app);


	// Socket setting
	let io = require('socket.io')(http);
	require('./lib/config/socket.Ctrl')(io);
	// Socket setting


app.use(bodypareser.urlencoded({limit:'20mb',extended:true}));
app.use(bodypareser.json({limit:'20mb'}));
	
app.use(express.static(path.join(__dirname,'app')));

routes.configure(app);

dbcreation.createDB();
dbcreation.CreateTables();



var server = app.listen(parseInt(process.env.port),function(){
	console.log('server start on '+ server.address().port+ ' port');
})	

app.use(morgan('tiny', {
    stream: loggerConf.stream
})); 

