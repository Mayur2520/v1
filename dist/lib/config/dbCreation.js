var connection = require('./connection');
// var logger = require('./logger');
var fs = require('fs');
var mysql = require('mysql');
var cryptconf = require('./crypt.config');

var conn = mysql.createConnection({
    host: cryptconf.decrypt(process.env.host),
    user: cryptconf.decrypt(process.env.user),
    password: process.env.password,
});

module.exports = {
     createDB:function () {
        conn.connect(function (err) {
            if (err) throw err;
            else {

                conn.query("CREATE DATABASE IF NOT EXISTS v1", function (err, result) {
                    if (err) throw err;
                    else {
                    }
                });

            }
        });
    },
    CreateTables: function()
    {
        
    connection.acquire(function(err,con){
        if (err) {
       /*  logger.writeLogs({
            path: "users.controller/listSalespersons",
            line: "16",
            message: err
        }, 'error'); */
        throw err;}
        else
        {
        var data = fs.readFileSync('./db.json')
        var queries = JSON.parse(data);
        queries.map(function(value){
            con.query(value.Query, function(err) {
            if (err) {
                /* logger.writeLogs({
                path: "Tables Creations",
                line: "",
                message: err
            }, 'error'); */
                throw err;}
            });  
        });
        }
    })
    },
    
}
