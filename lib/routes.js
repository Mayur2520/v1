const security = require('./config/auth');
const multer = require('multer');
var path = require('path');
const dir = './app/uploads';

var user = require('./controller/user.Ctrl');
var product = require('./controller/products.ctrl');
var customer = require('./controller/customers.ctrl');
var order = require('./controller/orderd.ctrl');


let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
	}
});

let upload = multer({
	storage: storage
});



module.exports = {

	configure: function (app) {
		
		app.post('/api/authUser', function (req, res) {
			user.AuthenticateUser(req, res);
		});

		app.post('/api/SetNewPassword', function (req, res) {
			security(req, res);user.SetNewPassword(req, res);
		});

		app.post('/api/ForgotPassword', function (req, res) {
			user.ForgotPassword(req, res);
		});

		app.get('/api/SignOut', function (req, res) {
			security(req, res);user.SignOut(req, res);
		});

		app.get('/api/verifyOTP/:otp', function (req, res) {
			user.verifyOTP(req, res);
		});

		app.post('/api/saveProductDetails', upload.single('file'), function (req, res) {
			security(req, res);
			product.saveProductDetails(req, res);
		});

		app.post('/api/ImporProductsDetails', function (req, res) {
			security(req, res);
			product.ImporProductsDetails(req, res);
		});

		app.get('/api/getProductList', function (req, res) {
			security(req, res);
			product.getProductList(req, res);
		});

		app.get('/api/deleteProductDetails/:id', function (req, res) {
			security(req, res);
			product.deleteProductDetails(req, res);
		});

		app.get('/api/productTypes', function (req, res) {
			security(req, res);
			product.productTypes(req, res);
		});

		app.get('/api/productUnits', function (req, res) {
			security(req, res);
			product.productUnits(req, res);
		});


		app.get('/api/CustomerTypes', function (req, res) {
			security(req, res);
			customer.CustomerTypes(req, res);
		});

		app.get('/api/getCustomerList', function (req, res) {
			security(req, res);
			customer.getCustomerList(req, res);
		});

		app.get('/api/deleteCustomerDetails/:id', function (req, res) {
			security(req, res);
			customer.deleteCustomerDetails(req, res);
		});

		app.post('/api/VerifyCustomerEmail', function (req, res) {
			security(req, res);
			customer.VerifyCustomerEmail(req, res);
		});

		app.post('/api/VerifyCustomerMobile', function (req, res) {
			security(req, res);
			customer.VerifyCustomerMobile(req, res);
		});

		app.post('/api/SaveCustomerDetails', function (req, res) {
			security(req, res);
			customer.SaveCustomerDetails(req, res);
		});

		app.post('/api/saveOrderDetails', function (req, res) {
			security(req, res);
			order.saveOrderDetails(req, res);
		});

		app.post('/api/generateInvoice', function (req, res) {
			security(req, res);
			order.generateInvoice(req, res);
		});

		app.post('/api/ListOrders', function (req, res) {
			security(req, res);
			order.ListOrders(req, res);
		});

		app.post('/api/ListInvoice', function (req, res) {
			security(req, res);
			order.ListInvoice(req, res);
		});

		app.get('/api/getOrderDetails/:orderid', function (req, res) {
			security(req, res);
			order.getOrderDetails(req, res);
		});

		app.get('/api/deleteOrder/:id', function (req, res) {
			security(req, res);
			order.deleteOrder(req, res);
		});

		app.get('/api/confirmToDilivary/:id', function (req, res) {
			security(req, res);
			order.confirmToDilivary(req, res);
		});

		app.get('/api/getInvoicesOfCustomer/:customerid', function (req, res) {
			security(req, res);
			order.getInvoicesOfCustomer(req, res);
		});



		app.get('/api/getSession', function (req, res) {
			security(req, res);
			user.getSession(req, res);
		});


		app.get('/api/getUserList', function (req, res) {
			security(req, res);
			customer.getUserList(req, res);
		});

		app.get('/api/deleteUserDetails/:id', function (req, res) {
			security(req, res);
			customer.deleteUserDetails(req, res);
		});

		app.post('/api/VerifyUserEmail', function (req, res) {
			security(req, res);
			customer.VerifyUserEmail(req, res);
		});

		app.post('/api/VerifyUserMobile', function (req, res) {
			security(req, res);
			customer.VerifyUserMobile(req, res);
		});

		app.post('/api/SaveUserDetails', function (req, res) {
			security(req, res);
			customer.SaveUserDetails(req, res);
		});

		app.get('/api/getInvoiceDetailsForPayment/:orderid', function (req, res) {
			security(req, res);
			order.getInvoiceDetailsForPayment(req, res);
		});

		app.post('/api/savePaymentDetails', function (req, res) {
			security(req, res);
			order.savePaymentDetails(req, res);
		});

		app.post('/api/getPaymentsList', function (req, res) {
			security(req, res);
			order.getPaymentsList(req, res);
		});

		app.get('/api/deletePaymentDetails/:id', function (req, res) {
			security(req, res);
			order.deletePaymentDetails(req, res);
		});

		app.post('/api/VerifyCompanyMobile', function (req, res) {
			security(req, res);
			user.VerifyCompanyMobile(req, res);
		});


		app.post('/api/VerifyCompanyEmail', function (req, res) {
			security(req, res);
			user.VerifyCompanyEmail(req, res);
		});

		
		app.post('/api/SaveCompanyDetails', upload.single('file'), function (req, res) {
			security(req, res);
			user.SaveCompanyDetails(req, res);
		});
		
		app.get('/api/getCompanyList', function (req, res) {
			security(req, res);
			user.getCompanyList(req, res);
		});

		app.get('/api/deleteCompanyDetails/:companyid', function (req, res) {
			security(req, res);
			user.deleteCompanyDetails(req, res);
		});

		

    }
};