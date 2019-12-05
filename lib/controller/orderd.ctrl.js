var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');


module.exports = {

    saveOrderDetails: function(req, res)
    {

        if (req.decoded.success == true) {  
            if(req.body[0].customerdetails.orderid)
            {
                connection.acquire(function(err, con){

                    if(req.body[0].customerdetails.customername.id)
                {
                    var changeCustomer = "`customerid`= "+req.body[0].customerdetails.customername.id+",";
                }
                else
                {
                    var changeCustomer = "";
                }
                
                   
                var sql = 'UPDATE `ordermaster` SET '+changeCustomer+' `orderdate`= "'+req.body[0].customerdetails.orderdate+'" WHERE `id` = '+req.body[0].customerdetails.orderid+';';
                
                req.body.map(function(value){
                    if(value.qty == 0)
                    {
                        sql = sql + 'DELETE FROM `orderdetails` WHERE `orderid` = '+req.body[0].customerdetails.orderid+' AND `productid` = '+value.id+';';
                    }
                    else
                    {
                        if(value.orderdetailsid || value.details_id)
                        {
                            sql = sql + 'UPDATE `orderdetails` SET `qty`= '+value.qty+',`dil_qty`= '+value.dil_qty !=null?value.dil_qty:null+', `unit`= "'+value.unit+'" WHERE `orderid` = '+req.body[0].customerdetails.orderid+' AND `productid` = '+value.id+';';
                        }
                        else
                        {
                            sql = sql + 'INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `unit`) VALUES ('+req.body[0].customerdetails.orderid+','+value.id+','+value.qty+',"'+value.unit+'");';
                        }
                       
                    }
                });

                    con.query(sql, function(err,result){
                        if(err)
                {
                    console.log(err)
                    res.send({
                        status: 0,
                        type: "error",
                        title: "Oops!",
                        message: "Something went wrong, Please try again."
                    });
                }
                else
                {
                    res.send({
                        status: 1,
                        type: "success",
                        title: "Done!",
                        message: "Order updated successfully."
                    });
                }
                    });
                    con.release();
                });
            }
            else
            {
            connection.acquire(function(err, con){

                if(req.decoded.logedinuser.role == 'customer')
                {
                    var customerid = req.decoded.logedinuser.customerid
                }
                else
                {
                    var customerid = req.body[0].customerdetails.customername.id
                }

                con.query('SELECT * FROM `ordermaster` WHERE `customerid` = '+customerid+' AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") = ADDDATE(DATE_FORMAT("'+req.body[0].customerdetails.orderdate+'", "%Y/%m/%d"), INTERVAL 1 DAY)', function(err, result){
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
                        if(result.length > 0)
                        {
                            res.send({
                                status: 0,
                                type: "error",
                                title: "Oops!",
                                message: "Order already placed for selected date."
                            });
                        }
                        else
                        {

                       

                con.query('INSERT INTO `ordermaster`(`customerid`, `orderdate`, `createdby`, `companyid`) VALUES (?,ADDDATE(DATE_FORMAT("'+req.body[0].customerdetails.orderdate+'", "%Y/%m/%d"), INTERVAL 1 DAY),?,?)',[customerid,req.decoded.logedinuser.id,req.decoded.logedinuser.companyid], function(err, result){
                    if(err)
                    {
                        console.log('err ----1')
                        console.log(err)
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
                            ss = ss+"("+orderid+","+value.id+","+value.qty+",'"+value.unit+"'),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `unit`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
                                console.log('err ----2')
                                console.log(err)
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
                                    message: "Order inserted successfully"
                                });
                                
                            }
                        })
                    }
                });
            }
        }
                });

                con.release();
            });
        }
        }
    },

    ListOrders: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT `id`,status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer')
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") ORDER BY id DESC';
                }
            }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({ordersList:result});
                    }
                    con.release();
                })
            });
        }
    },

    getOrderDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT *, (SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({orderDetails:result});
                    }
                    con.release();
                })
            })
        }
    },

    deleteOrder: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('UPDATE `ordermaster` SET `status` = 1 WHERE ordermaster.id = '+req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                    con.release();
                })
            })
        }
    },

}