var mysql = require('mysql');
var cryptconf = require('./crypt.config');
// var mysqlDump = require('mysqldump');

function Connection() {

  this.pool = mysql.createPool({
    connectionLimit: 100,
    multipleStatements: true,
    host: cryptconf.decrypt(process.env.host),
    user: cryptconf.decrypt(process.env.user),
    password: process.env.password,
    database: cryptconf.decrypt(process.env.database)
  });

  this.acquire = function (callback) {
    this.pool.getConnection(function (err, connection) {
      callback(err, connection);
    });
  };

  /* try
  {
    mysqlDump({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fd',
    dest:'www/files/ThreesaDataBaseBackup.sql' // destination file 
},function(err){
    // create data.sql file; 
})
  }
  catch(e)
  {
	  console.log(e)
  }
   */
}

module.exports = new Connection();