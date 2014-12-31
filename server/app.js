var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

var dbconnect = require('./database/dbconnect');
var passportStrategies = require('./controllers/passport');

var index = require('./routes/index');
var rest = require('./routes/rest');
var login = require('./routes/login');
var test = require('./_test/routes');

var app = express();

(function configure(){
    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    //enable session
    app.use(session({
        secret: 'polytrix_session',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: app.get('env') === 'production' ? true : false }
    }));

    //passport
    app.use(passport.initialize());
    app.use(passport.session());
})();

//routers
app.use(index);
app.use(rest);
app.use(login);

/**
 * Development Settings
 */
if (app.get('env') === 'development') {
    // This will change in production since we'll be using the dist folder
    app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));

    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {

    // changes it to use the optimized version for production
    app.use(express.static(path.join(__dirname, '/dist')));

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

app.use(test);


module.exports = app;
