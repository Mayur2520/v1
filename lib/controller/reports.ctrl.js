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
                var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id,products.unit as product_unit, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {

                    var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id,products.unit as product_unit, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products WHERE  customers.id = '+req.decoded.logedinuser.customerid;
                }
                else
                {

                    var sql = 'SELECT customers.name AS cust_name,products.name AS product_name, products.id AS product_id,products.unit as product_unit, customers.id AS cust_id, IFNULL((SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND orderdetails.orderid = (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.customerid = customers.id AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d") LIMIT 1) LIMIT 1),0) AS total_qty FROM `customers` INNER JOIN products WHERE  customers.companyid = '+req.decoded.logedinuser.companyid;
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

};