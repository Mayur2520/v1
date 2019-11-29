var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');


module.exports = {

    saveOrderDetails: function(req, res)
    {


        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('INSERT INTO `ordermaster`(`customerid`, `orderdate`, `createdby`, `companyid`) VALUES (?,CURDATE(),?,?)',[req.body[0].customerdetails.customername.id,req.decoded.logedinuser.id,req.decoded.logedinuser.companyid], function(err, result){
                    if(err)
                    {

                    }
                    else
                    {

                    }
                });
            });
        }
    },

}