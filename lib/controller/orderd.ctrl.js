var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var notification = require('../config/pushNotification');
        
        var pdf = require('html-pdf');

        var path = require('path');

        var moment = require('moment');

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
                   
                 

                var sql = 'UPDATE `ordermaster` SET '+changeCustomer+''+changeCartStatus+' `orderdate`= "'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'" WHERE `id` = '+req.body[0].customerdetails.orderid+';';
                
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

                    con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                        if(notificationResult.length > 0)
                        {
                            regTokens = [];
                            notificationResult.map(function(value){
                                if(value.deviceid != null && value.deviceid !='')
                                regTokens.push(value.deviceid)
                            });
                            if(regTokens.length > 0)
                            notification.sendNotification({title:'Order Update', message:"Your order modified successfully for date "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' Order Modified by '+notificationResult[0].orderedby,icon:'',registrationTokens:regTokens});
                         }
                    });


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

                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var customerid = req.decoded.logedinuser.customerid
                }
                else
                {
                    var customerid = req.body[0].customerdetails.customername.id
                }

                con.query('SELECT * FROM `ordermaster` WHERE `customerid` = '+customerid+' AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") = "'+req.body[0].customerdetails.orderdate+'"', function(err, result){
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

                       

                con.query('INSERT INTO `ordermaster`(`customerid`, `orderdate`, `createdby`, `companyid`) VALUES (?,"'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'",?,?)',[customerid,req.decoded.logedinuser.id, req.decoded.logedinuser.companyid], function(err, result){
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
                        var orderid = result.insertId;
                        var ss = '';
                        req.body.map(function(value){
                            ss = ss+"("+orderid+","+value.id+","+value.qty+",'"+value.unit+"'),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `unit`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
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

                                con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                                    if(notificationResult.length > 0)
                                    {
                                        regTokens = [];
                                        notificationResult.map(function(value){
                                            if(value.deviceid != null && value.deviceid !='')
                                            regTokens.push(value.deviceid)
                                        });
                                        if(regTokens.length > 0)
                                        notification.sendNotification({title:'Order Placed', message:"Your order placed successfully for date "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' Order placed by '+notificationResult[0].orderedby,icon:'',registrationTokens:regTokens});
                                     }
                                });

                               

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
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE ordermaster.status = 0 AND ordermaster.customerid = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
            }


                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
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
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.decoded.logedinuser.customerid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")) ORDER BY id DESC';
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

    getPaymentsList: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT *, (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT *,(SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE `customerid` = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT *,(SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE `companyid` =  '+req.decoded.logedinuser.companyid+'  AND (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
            }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({PaymentsList:result});
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
                con.query('SELECT *, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.marathi_name FROM products WHERE products.id = orderdetails.productid) AS marathi_name, (SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name, (SELECT customers.address FROM customers WHERE customers.id = ordermaster.customerid) as cust_addr, (SELECT customers.mobile FROM customers WHERE customers.id = ordermaster.customerid) as cust_mobile FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid, function(err, result){
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

    deletePaymentDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('DELETE FROM `customerordrpayment` WHERE `id` ='+ req.params.id, function(err, result){
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

    getInvoicesOfCustomer: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.params.customerid+' AND `invoicestatus`= 1 AND pendingpayment > 0 ORDER BY id DESC', function(err, result){
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

                var sql ="UPDATE `ordermaster` SET `grossamt`= "+req.body[0].totalAmount+", `taxamt`= "+req.body[0].taxamt+",`netamt`= "+req.body[0].netamt+",`deliverycharges`= "+req.body[0].deliverycharges+",`pendingpayment` = "+req.body[0].netamt+",`invoicestatus`= 1,`invoicedate`= orderdate WHERE `id` = "+req.body[0].orderid+';';

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


                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body[0].customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Invoice Generated', message:"Invoice Generated for order dated "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' of rupees'+req.body[0].netamt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

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
              /*   var sql1 = 'SELECT COUNT(*) as orderidexist FROM `customerordrpayment` WHERE `orderid` = '+req.params.orderid; */

                var sql2 =  'SELECT *,ordermaster.pendingpayment as amounttopaid, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid+' AND ordermaster.pendingpayment != 0';

               /*  var sql3 = 'SELECT *, customerordrpayment.pendingamt as amounttopaid, (SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate, (SELECT ordermaster.invoicedate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as invoicedate, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.`customerid`) as cust_name FROM `customerordrpayment` INNER JOIN orderdetails on orderdetails.orderid = customerordrpayment.`orderid` WHERE customerordrpayment.orderid = '+req.params.orderid+' ORDER BY customerordrpayment.id DESC limit 1' */
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
                        /* if(result[0].orderidexist > 0)
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
                        } */

                        res.send({
                            invoicedetails:result
                        });
                    }
                    con.release();
                })
            });
        }
    },

    savePaymentDetails : function(req, res)
    {
         if (req.decoded.success == true) {   
            var inutparams = [req.body.orderid, req.body.customerid, req.body.paid_amt, parseFloat(req.body.pendingamt), req.body.paid_by, req.body.payment_mode, req.body.txnno, req.body.bank?req.body.bank:null, req.decoded.logedinuser.id, req.decoded.logedinuser.companyid, parseFloat(req.body.pendingamt), req.body.orderid];
            connection.acquire(function(err, con){
                con.query('INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`,`txnno`, `txndate`, `bank`, `createdby`, `companyid`) VALUES (?,?,?,?,"'+moment(req.body.payment_date).format("DD-MM-YYYY HH:mm:ss")+'",?,?,?,"'+moment(req.body.txndate).format("DD-MM-YYYY HH:mm:ss")+'",?,?,?);UPDATE `ordermaster` SET `pendingpayment` = ? WHERE `id` = ?;',inutparams, function(err, result){
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

                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body.customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Payment Received', message:"Payment received for order no. "+req.body.orderid+' of rupees'+req.body.paid_amt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

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
    getInvoiceListForLumsumPayment : function(req, res)
    {

        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('select a.id, a.customerid, a.netamt, a.pendingpayment, a.`orderdate`,  a.`invoicedate` from ordermaster a WHERE a.pendingpayment > 0 AND  a.status = 0 AND a.customerid = '+parseInt(req.params.customerid)+' ORDER BY a.id ASC', function(err, result){
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

                        var balanceamount = parseFloat(req.params.amount);
                        var sortedResult = [];
                        result.map(function(value, index){

                            if(balanceamount > 0)
                            {
                                balanceamount = balanceamount - value.netamt;
                                sortedResult.push(value); 
                            }    
                        });

                        res.send({invoiceList: sortedResult});
                    }
                    con.release();
                })
            });
        } 

    },

    getCustomerAdvancePayment : function(req, res)
    {

        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT advance_payment.amount FROM advance_payment WHERE advance_payment.customerid = '+parseInt(req.params.customerid)+' LIMIT 1', function(err, result){
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
                        if(result.length > 0)
                        {
                            if(result[0].amount == null)
                               result[0].amount = 0
                            else
                            result[0].amount = result[0].amount;
                        }
                        else
                        {
                            result.push({amount:0});
                        }
                        
                        res.send(result[0]);
                    }
                    con.release();
                })
            });
        } 

    },

    saveLumsumPaymentDetails : function(req, res)
    {
       

        // console.log( req.body)
        
       

       /*  req.body.map(function(value){
            if(value.pendingpayment < value.paidamt)
                var paidamt = value.pendingpayment;
                else
                var paidamt = value.paidamt;
            
            if(value.balance < 0)
            var pendingamt = 0
            else
            var pendingamt = value.balance;

            sql = sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`, `txnno`, `txndate`, `bank`, `paidlumpsum`,`createdby`, `companyid`) VALUES ('+value.id+','+value.customerid+','+paidamt+','+pendingamt+',"'+req.body[0].paymentDetails.payment_date+'","'+req.body[0].paymentDetails.paid_by+'","'+req.body[0].paymentDetails.payment_mode+'","'+req.body[0].paymentDetails.payment_mode+'","'+req.body[0].paymentDetails.txnno?req.body[0].paymentDetails.txnno:null+'","'+req.body[0].paymentDetails.txndate+'","'+req.body[0].paymentDetails.bank?req.body[0].paymentDetails.bank:null+'",1,'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+');UPDATE `ordermaster` SET `pendingpayment` = '+pendingamt+' WHERE `id` = '+value.id+';';
        }); */


        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){


                var sql = '';


                for(var i = 0 ; i < req.body.length;i++)
                {
                    var value = req.body[i];
                    if(value.pendingpayment < value.paidamt)
                    var paidamt = value.pendingpayment;
                    else
                    var paidamt = value.paidamt;
                
                if(value.balance < 0)
                var pendingamt = (-1)*value.balance
                else
                var pendingamt = 0;

                if(req.body[0].paymentDetails.txnno != undefined)
                    var txnno = req.body[0].paymentDetails.txnno;
                    else
                    var txnno = null;
        
                if(req.body[0].paymentDetails.bank != undefined)
                    var bank = req.body[0].paymentDetails.bank;
                    else
                    var bank = null;
        
                sql = sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`, `txnno`, `txndate`, `bank`, `paidlumpsum`,`createdby`, `companyid`) VALUES ('+value.id+','+value.customerid+','+paidamt+','+pendingamt+',"'+req.body[0].paymentDetails.payment_date+'","'+req.body[0].paymentDetails.paid_by+'","'+req.body[0].paymentDetails.payment_mode+'","'+txnno+'","'+req.body[0].paymentDetails.txndate+'","'+bank+'",1,'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+');UPDATE `ordermaster` SET `pendingpayment` = '+pendingamt+' WHERE `id` = '+value.id+';';        
                }

                // if(req.body[0].paymentDetails.adnvanceBalanceAmount > 0)
                {
                    sql = sql+'DELETE FROM `advance_payment` WHERE `customerid` = '+req.body[0].customerid+' ;INSERT INTO `advance_payment`(`customerid`, `amount`, `updateddate`) VALUES ('+req.body[0].customerid+','+req.body[0].paymentDetails.adnvanceBalanceAmount+',CURDATE())';
                }
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


                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body[0].customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Payment Received', message:"Payment received of rupees"+paidamt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record inserted successfully"
                        });
                    }
                    con.release();
                }) 
            });
        } 
    },

    shareInvoice: function(req, res)
    {

        var options = { "height": (req.body.size.height + parseInt(10))+'px',        // allowed units: mm, cm, in, px
        "width": "5.2in",
        "header": {
            "height": "1mm",
            "default": req.body.billheader
          },
          "footer": {
            "height": "1mm",
          }
    };

        var filename = 'invoice_'+req.body.orderData.cust_name+'-'+req.body.orderData.orderid+'-'+new Date(req.body.orderData.invoicedate).toDateString().replace(/ /g,"-")+'.pdf';
        pdf.create(req.body.invoiceContent, options).toFile('./app/invoices/'+filename, function(err, result) {
            if (err)
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
            }
            else
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
                res.send({filename:filename});
            }
            
          });

    },

    getDashboardValues: function(req, res)
    {

        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query( 'SELECT (SELECT COUNT(*) FROM products WHERE products.companyid = users.companyid) as products_count, (SELECT COUNT(*) FROM customers WHERE customers.companyid = users.companyid) as customer_counts, (SELECT COUNT(*) FROM ordermaster WHERE ordermaster.companyid = users.companyid AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") ) AS orders_count, (SELECT COUNT(*) FROM ordermaster WHERE ordermaster.companyid = users.companyid AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") AND ordermaster.invoicestatus = 1) AS invoice_count, (SELECT SUM(customerordrpayment.paidamt) FROM customerordrpayment WHERE customerordrpayment.companyid = users.companyid  AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d")) as total_payment FROM `users` WHERE `id` = '+req.decoded.logedinuser.id, function(err, result){
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
                    else{
                        res.send({dashboardValues: result})
                    }
                });
                con.release();
            });
        }

       
    },


}