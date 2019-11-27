// Users.js
var jwt = require('jsonwebtoken');
var express = require('express');
var nodemailer = require('nodemailer');
var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var fs = require('fs');
var app = express();


app.set('superSecret', process.env.jwt_sec); // secret variable

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: cryptconf.decrypt(process.env.sendermail), // generated ethereal user
        pass: cryptconf.decrypt(process.env.senderpass) // generated ethereal password
    }
});


var verificationObject = [{}];

function getvaluesinObject(passedval) {
    var charindex = passedval.indexOf("=");
    var strindex = passedval.length;
    var field = passedval.substring(0, charindex).trim();
    var value = passedval.substring(charindex + 1, strindex);

    verificationObject[0][field] = value.trim();
};

module.exports = {

    AuthenticateUser: function(req,res)
    {
        connection.acquire(function (err, con) {
				
            var encpass = cryptconf.encrypt(req.body.password)
            console.log(encpass)
            con.query("SELECT id,name,firstlogin,role,companyid from users WHERE mobile =? AND password = ?", [req.body.mobile, encpass], function (err, result) {
                if (err) {
                    console.log('---1',err)
                    res.send({
                        success: false,
                        type: "error",
                        title: "Oops!",
                        message: 'Somthing went wrong, Please try again.'
                    });
                } else {
                    if (result.length > 1 || result.length <= 0) {
                        res.json({
                            success: false,
                            type: "error",
                            title: "Oops!",
                            message: 'Login cridentials does not matched.'
                        });
                    }
                    if (result.length == 1) {
                        if (result[0].role === 'Superadmin') {
                            var sql = "select 'welcome'";
                        } else {
                            var sql = "SELECT approval from company WHERE id = " + result[0].companyid;
                        }
                        con.query(sql, function (err, companyapproval) {
                            if (err) {
                                console.log('---2',err)
                                res.send({
                                    success: false,
                                    type: "error",
                                    title: "Oops!",
                                    message: 'Somthing went wrong, Please try again.'
                                });
                            } else {
    
                                if (result[0].role === 'Superadmin') {
                                    var payload = {
                                        logedinuser: result[0]
                                    }
                                    var token = jwt.sign(payload, app.get('superSecret'), {
                                        expiresIn: 86400 // expires in 24 hours = 86400    -  28800
                                    });
    
                                    var d = new Date();
                                    d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                    var expires = d.toUTCString();
    
                                    res.cookie('token', token, {
                                        expires: new Date(expires),
                                        httpOnly: true
                                    });
                                    res.send({
                                        success: true,
                                        type: "success",
                                        title: "Welcome!",
                                        message: 'logged in successfully.',
                                        firstlogin: result[0].firstlogin
                                    });
                                } else {
                                    if (companyapproval[0].approval === 0) {
                                        res.send({
                                            success: false,
                                            type: "error",
                                            title: "Oops!",
                                            message: 'your company did not approved by superadmin please contact with your vendor for aproval.'
                                        });
                                    } else {
                                        var payload = {
                                            logedinuser: result[0]
                                        }
                                        var token = jwt.sign(payload, app.get('superSecret'), {
                                            expiresIn: 86400 // expires in 24 hours = 86400
                                        });
    
                                        var d = new Date();
                                        d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                        var expires = d.toUTCString();
    
                                        res.cookie('token', token, {
                                            expires: new Date(expires),
                                            httpOnly: true
                                        });
                                        res.send({
                                            success: true,
                                            type: "success",
                                            title: "Welcome!",
                                            message: 'logged in successfully.',
                                            firstlogin: result[0].firstlogin
                                        });
                                    }
                                }
    
                            }
                        });
                    }
                }
            });
        });
    
    },

    SignOut: function(req,res)
    {

    },

    SetNewPassword: function(req,res)
    {
        if (req.decoded.success == true) {	
            connection.acquire(function (err, con) {
               if(req.Loggedinuser.forgotpassword)
                    {
                        var isforgot = 1;
                          res.clearCookie('forgotpassword');
                    }
                    else
                    {
                        var isforgot = 0;
                    }
               
                 var encpass = cryptconf.encrypt(req.body[0].password)
               
                con.query("UPDATE users SET password = ?,firstlogin = 1 WHERE id = "+ req.decoded.logedinuser.id,[encpass], function (err, result) {
                    if(err)
                    {
                        res.send({
                status: false,
                 type: "error",
                 title: "Oops!",
                 message: 'Something went wrong,Please try again',
                
                });
                } else {
                res.send({
                status: true,
                 type: "success",
                 title: "Done!",
                 message: 'Password updated successfully.',
                 forgotpassword:isforgot
            });
            
        }
           });
        }); 
        }
    },

    ForgotPassword: function(req,res)
    {
        connection.acquire(function (err, con) {
            con.query("SELECT id,email from users WHERE email = ?", [req.body.email], function (err, result) {
             if (err) {
                 res.send({
                     success: false,
                         type: "error",
                         title: "Oops!",
                     message: 'Somthing went wrong, Please try again.'
                 });
                 mongoose.disconnect();
             } else {
                 
                 if (result.length > 1 || result.length <= 0) {
                     res.json({
                         success: false,
                         type: "error",
                         title: "Oops!",
                         message: 'Details does not matched.'
                     });
                 }
                 if (result.length == 1) {
                     var d = new Date();
                     d.setTime(d.getTime() + (0.1 * 24 * 60 * 60 * 1000));
                     var expires = d.toUTCString();
         
                     var otp = Math.floor(100000 + Math.random() * 900000);
                     var sentotp = cryptconf.encrypt(String(otp));
                     var userid = String(result[0].id);
                     
                     res.cookie('otp', sentotp, {
                         expires: new Date(expires),
                         httpOnly: true
                     });
         
                     res.cookie('forgotpassword', 1, {
                         expires: new Date(expires),
                         httpOnly: true
                     });
                     
                     
                                         var payload = {
                                             logedinuser: result[0]
                                         }
                                         var token = jwt.sign(payload, app.get('superSecret'), {
                                             expiresIn: 28800 // expires in 24 hours = 86400
                                         });
         
                                         var d = new Date();
                                         d.setTime(d.getTime() + (0.7 * 24 * 60 * 60 * 1000));
                                         var expires = d.toUTCString();
         
                                         res.cookie('token', token, {
                                             expires: new Date(expires),
                                             httpOnly: true
                                         });
                                         
         
                     const mailOptions = {
                         from: cryptconf.decrypt(process.env.sendermail), // sender address
                         to: result[0].email, // list of receivers
                         subject: 'Forgot Password', // Subject line
                         html: '<h1 style="font-weight:bold;text-align:center;">' + otp + '</h1> <br> <p>Please enter it for reset your password for CS portal.<br> This OTP is valid for 10 minuts. <br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (CS Pvt. Ltd.)</div></p>' // plain text body
                     };
         
                     
         
                     transporter.sendMail(mailOptions, function (err, info) {
                         if (err)
                         {
                             console.log(err)
                         }
                         else
                         {
                             console.log(info);
                                 res.send({
                             success: true,
                             type: "success",
                             title: "Sent!",
                             message: 'OTP sent to your registered mobile number.'
                             
                         });
                         }
                     });
         
         
                 }
             }
          });
          });
    },

    verifyOTP: function(req,res)
    {
        var cookies = req.headers.cookie.split(';', 5);
        cookies.map(function (value) {
            getvaluesinObject(value)
        });
    
        var recievedotp = encrypt(String(req.params.otp))
        if (recievedotp === verificationObject[0].otp) {
            res.clearCookie('otp', {
                path: '/'
            });
            res.send({
                status: 0
            });
        } else {
            res.send({
                status: 1
            });
        }
    },

    ResetPassword: function(req,res)
    {
        if (req.headers.cookie) {
            var cookies = req.headers.cookie.split(';', 5);
            cookies.map(function (value) {
                getvaluesinObject(value)
            });
            if (verificationObject[0].id) {
    
                if (err) {
                    res.send({
                        status: 1,
                        message: 'Somthing went wrong, Please try again!'
                    });
                } else {
                    res.send({
                        status: 0,
                        message: 'Password updated successfully, Thank you!'
                    });
                }
    
            } else {
                res.send({
                    status: 1,
                    message: 'Somthing went wrong, Please generate OTP again'
                });
            }
        } else {
            res.send({
                status: 1,
                message: 'Somthing went wrong, Please generate OTP again'
            });
        }
    },


};

