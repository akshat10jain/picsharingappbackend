
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const configConsts = require('../config/constants');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		default: null
	},
	phone: {
		type: String,
		sparse: true,
		required: false,
		unique: true
	},
	email: {
		type: String,
		lowercase: true,
		sparse: true,
		required: false,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	facebook: {
		type: String,
		sparse: true,
		required: false,
		unique: true
	},	// facebook user id
	google: {
		type: String,
		sparse: true,
		required: false,
		unique: true
	}

}, { timestamps: true });

userSchema.pre('save', function (next) {
	var user = this;
	const saltRounds = 12;

	if (!user.isModified('password')) {
		return next();
	}
	bcrypt.hash(user.password, saltRounds, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});


userSchema.methods.comparePassword = function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.checkIfUserExists = function (username, kind) {
	const where = {};
	if (!kind) {
		where['email'] = username;
	}
	else {
		where[kind] = username;
	}
	return this
		.findOne(where)
		.then((result) => {
			return result;
		})
		.catch((err) => {
			throw err;
		});
};


userSchema.statics.getUser = (userId) => {
	return User
		.findOne({ _id: userId }, { password: 0, _v: 0 })
		.then((result) => {
			return result;
		})
};

const User = module.exports = mongoose.model('user', userSchema);
