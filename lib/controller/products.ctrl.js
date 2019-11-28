var connection = require('../config/connection');

module.exports = {
    saveProductDetails: function(req, res)
    {
        if (req.decoded.success == true) {
            if (req.file) {
                req.body.productDetails.image = req.file ? req.file.filename : '';
            }
            if (req.body.productDetails.image != '' || req.body.productDetails.image != null) {
                req.body.productDetails.image = req.body.productDetails.image;
            }
    
            req.body.productDetails.createdby = req.decoded.logedinuser.id;
            req.body.productDetails.companyid = req.decoded.logedinuser.companyid;
            connection.acquire(function (err, con) {
                if (!req.body.productDetails.id) {
                    con.query("INSERT INTO `products` set ?", req.body.productDetails, function (err, result) {
                        if (err) {
                            console.log("err 1")
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Record inserted successfully."
                            });
                            con.release();
                        }
                    });
                }
                if (req.body.productDetails.id) {

                    if(req.body.productDetails.$hashKey)
                    {
                        delete req.body.productDetails.$hashKey;
                    }
                    con.query("UPDATE `products` set ? WHERE id = ?", [req.body.productDetails, req.body.productDetails.id], function (err, result) {
                        if (err) {
                            console.log("err 2")
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Record updated successfully."
                            });
                            con.release();
                        }
                    });
                }
            });
        }      
    },

    getProductList: function(req, res)
    {
        if (req.decoded.success == true) {   
        connection.acquire(function(err, con){
            if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'select * from products WHERE status = 0 ORDER BY name ASC';
            }
            else{
                var sql = 'select * from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY name ASC';
            }
            con.query(sql, function(err, result)
            {
                if(err)
                {
                    res.send({status:0, message:'Something went wrong, Please try again.'});
                }
                else
                {
                    res.send({productsList:result});
                }
                con.release();
            });
        });
    }
    },

    deleteProductDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
        connection.acquire(function(err, con){
            con.query('UPDATE products SET status = 1 WHERE id = '+req.params.id, function(err, result)
            {
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
            });
        });
    }
    },

    productTypes: function(req, res)
    {
        res.send(['Vegitable', 'English Vegitable', 'Fruit','Other']);
    },
   
    productUnits: function(req, res)
    {
        res.send(['kg.', 'gm.', 'dozen','piece']);
    },

    ImporProductsDetails: function(req, res)
    {
        var sql = 'INSERT INTO `products`(`name`, `type`, `createdby`, `companyid`) VALUES  ';
        var ss = '';
        req.body.map(function(value){
            if(value.DTDS0 != undefined){value.DTDS0}else{value.DTDS0 = ""}
            if(value.DTDS1 != undefined){value.DTDS1}else{value.DTDS1 = ""}

            ss= ss+ '("'+value.DTDS0+'","'+value.DTDS1+'",'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+'),';
        });
         ss = ss.substr(0, ss.length - 1);
       
        connection.acquire(function (err, con) {
            con.query(sql+ss,function(err,result)
            {
                if(err)
                    {
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went worng, Please try again letter"
                        });
                        con.release();
                    }
                    else
                    {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record imported successfully"
                        });
                        con.release();
                    }
            });
        });
    },
};