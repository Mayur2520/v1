var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var moment = require('moment');

module.exports = {


    
    getQtySaledReport: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {

                    var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products WHERE  customers.id = '+req.decoded.logedinuser.customerid;
                }
                else
                {

                    var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products WHERE  customers.companyid = '+req.decoded.logedinuser.companyid;
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
                        res.send({SaledReportData:result});
                    }
                    con.release();
                })
            });
        }
    },
    
    getOrderReport: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                if(req.body[0].customerid)
                {
                    var sql = 'SELECT ordermaster.orderdate,IFNULL(ordermaster.netamt,0) as net_amount,(SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as customer_name FROM ordermaster WHERE DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") AND ordermaster.customerid = '+req.body[0].customerid;
                }
                else
                var sql = 'SELECT ordermaster.orderdate,IFNULL(ordermaster.netamt,0) as net_amount,(SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as customer_name FROM ordermaster WHERE DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {

                    'SELECT ordermaster.orderdate,IFNULL(ordermaster.netamt,0) as net_amount,(SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as customer_name FROM ordermaster WHERE DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") AND ordermaster.customerid = '+req.decoded.logedinuser.customerid;
                }
                else
                {

                    if(req.body[0].customerid)
                {
                    var sql = 'SELECT ordermaster.orderdate,IFNULL(ordermaster.netamt,0) as net_amount,(SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as customer_name FROM ordermaster WHERE DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") AND ordermaster.customerid = '+req.body[0].customerid+' AND ordermaster.companyid = '+req.decoded.logedinuser.companyid;
                }
                else
                var sql = 'SELECT ordermaster.orderdate,IFNULL(ordermaster.netamt,0) as net_amount,(SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as customer_name FROM ordermaster WHERE DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") AND ordermaster.companyid = '+req.decoded.logedinuser.companyid;
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
                        res.send({orderReportData:result});
                    }
                    con.release();
                })
            });
        }
    },

};