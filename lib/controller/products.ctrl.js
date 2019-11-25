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
                var sql = 'select * from products ORDER BY id DESC';
            }
            else{
                var sql = 'select * from products WHERE companyid = '+req.decoded.logedinuser.companyid+' ORDER BY id DESC';
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
};