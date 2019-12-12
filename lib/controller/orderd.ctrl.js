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
                    if(req.body[0].customerdetails.cartStatus)
                    {
                        var changeCartStatus = "`cartstatus`= "+req.body[0].customerdetails.cartStatus+",";
                    }
                    else
                    {
                        var changeCartStatus = "";
                        
                    }
                   
                var sql = 'UPDATE `ordermaster` SET '+changeCustomer+''+changeCartStatus+' `orderdate`= ADDDATE(DATE_FORMAT("'+req.body[0].customerdetails.orderdate+'", "%Y/%m/%d"), INTERVAL 1 DAY) WHERE `id` = '+req.body[0].customerdetails.orderid+';';
                
                req.body.map(function(value){
                    if(value.qty == 0 || value.qty == null || value.qty == undefined)
                    {
                        sql = sql + 'DELETE FROM `orderdetails` WHERE `orderid` = '+req.body[0].customerdetails.orderid+' AND `productid` = '+value.id+';';
                    }
                    
                    
                    {
                         if(value.orderdetailsid || value.details_id)
                        {

                            var detailsId = value.orderdetailsid || value.details_id;

                            if(value.dil_qty != undefined && value.dil_qty != null)
                            {
                                var setDilQty = '`dil_qty` = '+value.dil_qty+', ';
                            }
                            else
                            {
                                var setDilQty = '';
                            }
                            sql = sql + 'UPDATE `orderdetails` SET `qty`= '+value.qty+', '+setDilQty+' `unit`= "'+value.unit+'" WHERE `id` = '+detailsId+';';
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
                var sql = 'SELECT `id`,status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") ORDER BY id DESC';
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


    ListInvoice: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT `id`,status, `invoicedate`,`netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND `invoicestatus`= 1 AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.decoded.logedinuser.customerid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d") ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(`ordermaster.orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d") ORDER BY id DESC';
                }
            }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({invoiceList:result});
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
                con.query('SELECT *, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid, function(err, result){
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

    getInvoicesOfCustomer: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.params.customerid+' AND `invoicestatus`= 1 ORDER BY id DESC', function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({invoiceList:result});
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

    confirmToDilivary: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('UPDATE `ordermaster` SET `diliverystatus` = 1 WHERE ordermaster.id = '+req.params.id, function(err, result){
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
                            message: "Done"
                        });
                    }
                    con.release();
                })
            })
        }
    },

    generateInvoice: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){

                var sql ="UPDATE `ordermaster` SET `grossamt`= "+req.body[0].totalAmount+", `taxamt`= "+req.body[0].taxamt+",`netamt`= "+req.body[0].netamt+",`invoicestatus`= 1,`invoicedate`= CURDATE() WHERE `id` = "+req.body[0].orderid+';';

                req.body.map(function(value){
                    sql = sql+'UPDATE `orderdetails` SET `price`= '+value.price+',`netprice`= '+value.netprice+' WHERE `id` = '+value.details_id+';'
                });


                con.query(sql, function(err, result){
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
                            message: "Done"
                        });
                    }
                    con.release();
                })
            })
        }
    },
    getInvoiceDetailsForPayment : function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                var sql1 = 'SELECT COUNT(*) as orderidexist FROM `customerordrpayment` WHERE `orderid` = '+req.params.orderid;

                var sql2 =  'SELECT *,ordermaster.netamt as amounttopaid, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid;

                var sql3 = 'SELECT *, customerordrpayment.pendingamt as amounttopaid, (SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate, (SELECT ordermaster.invoicedate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as invoicedate, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.`customerid`) as cust_name FROM `customerordrpayment` INNER JOIN orderdetails on orderdetails.orderid = customerordrpayment.`orderid` WHERE customerordrpayment.orderid = '+req.params.orderid+' ORDER BY customerordrpayment.id DESC limit 1'
                con.query(sql1, function(err, result){
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
                        if(result[0].orderidexist > 0)
                        {
                            con.query(sql3, function(err, result){
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
                                        invoicedetails:result
                                    });
            
                                   
                                }
                               
                            })
                        }
                        else
                        {
                            con.query(sql2, function(err, result){
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
                                        invoicedetails:result
                                    });
                                }
                              
                            }) 
                        }

                       
                    }
                    con.release();
                })
            });
        }
    },

    savePaymentDetails : function(req, res)
    {
         if (req.decoded.success == true) {   
            var inutparams = [req.body.orderid, req.body.customerid, req.body.paid_amt, parseFloat(req.body.pendingamt), req.body.paid_by, req.body.payment_mode, req.decoded.logedinuser.id, req.decoded.logedinuser.companyid]
            connection.acquire(function(err, con){
                con.query('INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`, `createdby`, `companyid`) VALUES (?,?,?,?,ADDDATE(DATE_FORMAT("'+req.body.payment_date+'", "%Y/%m/%d"), INTERVAL 1 DAY),?,?,?,?)',inutparams, function(err, result){
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
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record inserted successfully."
                        });
                    }
                    con.release();
                })
            });
        } 
    },
}