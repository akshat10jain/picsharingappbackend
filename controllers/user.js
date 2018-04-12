
const User = require('../Models/User');
const tokenHelper = require('../helpers/tokenHelper');


exports.validateAuthCredentials = (req, res, next) => {

	req.assert("username", "username cannot be empty.").notEmpty();
	req.assert("password", "Password cannot be empty").notEmpty();
	req.assert("password", "Must be between 6 to 20 characters").len(6, 20);

	req.getValidationResult()
		.then((result) => {
			if (!result.isEmpty()) {
				result.useFirstErrorOnly();
				return res.status(400).json({
					error: true,
					errors: result.array(),
					data: []
				});
			}
			next();
		});
};

exports.signUp = (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const name = req.body.name || null;
	User.checkIfUserExists(username, 'email')
		.then((result) => {
			if (result && result._id) {
				return res.status(400).json({
					error: true,
					errors: [{
						param: "username",
						msg: "USER_ALREADY_EXISTS"
					}],
					data: {}
				});
			}

			let userObj = { email: username, password: password, name: name };
			let user = new User(userObj);

			user.save()
				.then(() => {
					return res.status(200).json({
						error: false,
						errors: [],
						data: user
					});
				})
		})
		.catch((err) => {
			return res.status(500).json({
				error: true,
				errors: [{
					param: "DB_ERROR",
					msg: err.message
				}],
				data: {}
			});
		});
};


exports.signIn = (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	User.checkIfUserExists(username, 'email')
		.then((existingUser) => {
			if (!existingUser || !existingUser._id) {
				return res.status(400).json({
					error: true,
					errors: [{
						param: "User",
						msg: "Please SignUp first."
					}],
					msg: "USER_NOT_SIGNED_UP",
					data: []
				});

			}
			existingUser.comparePassword(password)
				.catch((err) => {
					return res.status(500).json({
						error: true,
						errors: [{
							param: "DB_ERROR",
							msg: err.message
						}],
						data: {}
					});
				})
				.then((isMatch) => {
					if (isMatch) {
						const token = tokenHelper.sign({
							_id: existingUser._id,
							name: existingUser.name || null,
							phone: existingUser.phone || null,
							email: existingUser.email,
						});
						return res.status(200).json({
							error: false,
							errors: [],
							data: 'bearer '+token
						});
					} else {
						return res.status(401).json({
							error: true,
							errors: [{
								param: "password",
								msg: "Password did not matched."
							}],
							msg: "Incorrect password."
						});
					}
				});

		});
};


