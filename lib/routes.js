const security = require('./config/auth');
const multer = require('multer');
var path = require('path');
const dir = './app/uploads';

var user = require('./controller/user.Ctrl');
var product = require('./controller/products.ctrl');


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

		app.get('/api/productTypes', function (req, res) {
			security(req, res);
			product.productTypes(req, res);
		});
		app.get('/api/productUnits', function (req, res) {
			security(req, res);
			product.productUnits(req, res);
		});


    }
};