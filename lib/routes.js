const security = require('./config/auth');
const multer = require('multer');
var path = require('path');
const dir = './app/uploads';

var user = require('./controller/user.Ctrl');
var product = require('./controller/products.ctrl');
var customer = require('./controller/customers.ctrl');


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


    }
};