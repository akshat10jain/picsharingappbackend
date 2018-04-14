const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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

exports.forgotPassword = (req, res) => {
	const email = req.body.email;

	if (!email) {
		return res.status(500).json({
			error: true,
			errors: [{
				param: "email",
				msg: "NO_MAIL_ERROR"
			}],
			data: {}
		});
	}
	const url = ""; // URL to be clicked by user to set the new password
	const passwordResetMail = `
	<body>
		<div>
			<h3>Dear ${email},</h3>
			<p>You requested for a password reset, kindly use this <a href=${url}>link</a> to reset your password</p>
			<br>
			<p>Cheers!</p>
		</div>
	</body>
	`;

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		// service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail'
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: 'ruoz6nej2xmqm2pb@ethereal.email',
			pass: 'rHV9gZGKHNNBvTttrm'
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Pic Sharing" <picsharingapp@gmail.com>', // sender address
		to: email, // list of receivers
		subject: 'Password Reset Mail', // Subject line
		html: passwordResetMail // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

		return res.status(200).json({
			error: false,
			errors: [{
				param: "Send Mail",
				msg: "Mail sent successfully!"
			}],
			data: {}
		});
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	});
};

exports.resetPassword = (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	// Create a Salted Hash of the password and store it against the user requesting it.
	User.checkIfUserExists(email, 'email')
		.then((result) => {
			if (result && result._id) {
				bcrypt.hash(password, 12)
					.then(hash => {
						return User.update({ email: email }, { $set: { password: hash } }).exec();
					})
					.then((result) => {
						return res.status(200).json({
							error: false,
							param: "password",
							msg: "Password Updated successfully!"
						});
					});
			}
			else {
				return res.status(400).json({
					error: true,
					errors: [{
						param: "username",
						msg: "USER_ALREADY_EXISTS"
					}],
					data: {}
				});
			}
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


exports.homepage = (req, res) => {
    res.render('index')
}