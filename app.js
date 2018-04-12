
var express = require('express');
var path = require('path');
var passport = require('passport')
var bodyParser = require('body-parser');
const expressValidator = require('express-validator');
require('./db/db')
var app = express();


app.use(bodyParser.json());
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const tokenHelper = require("./helpers/tokenHelper");
tokenHelper.validate(passport)

//define controllers


const indexRouter = require('./routes/index');
const appRouter = require('./routes/app');
const authRouter = require('./routes/auth');

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/app', passport.authenticate('jwt', { session: false }), appRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
});



module.exports = app;
