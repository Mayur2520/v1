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
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        var orderid = result.insertId;
                        var ss = '';
                        req.body.map(function(value){
                            ss = ss+"("+orderid+","+value.id+","+value.qty+","+value.prunit+"),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `unit`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
                                    con.query("DELETE FROM `ordermaster` WHERE `id` = "+orderid,function(err, delResult){
                                        res.send({
                                            status: 0,
                                            type: "error",
                                            title: "Oops!",
                                            message: "Something went wrong, Please try again."
                                        });
                                    });
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                                
                            }
                        })
                    }
                });
                con.release();
            });
        }
    },

}