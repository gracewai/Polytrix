var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var dbconnect = require('./database/dbconnect');
var passportStrategies = require('./controllers/passport');

var _404 = require('./routes/404');
var login = require('./routes/login');
var rest = require('./routes/rest');
var userRest = require('./routes/userRest');
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
        store: new MongoStore({
            db:dbconnect.db,
            host:dbconnect.ip,
            port:dbconnect.port,
            touchAfter: 5 * 60,//5 minutes
            ttl: 60 * 60,//1 hour
        }),
        secret: 'polytrix_session',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: app.get('env') === 'production' ? true : false, maxAge: 60 * 60 * 1000 }
    }));

    //passport
    app.use(passport.initialize());
    app.use(passport.session());
})();

//routers

app.use(require('./controllers/user/logging').handleStayLogin);
app.use(login);
app.use(rest);
app.use(userRest);



/**
 * Development Settings
 */
if (app.get('env') === 'development' || !app.get('env')) {
    app.get('/',function(req,res){
        res.sendFile(path.join(__dirname, '../client/app/welcome.html'));
    });

    app.get('/console/',function(req,res){
        res.sendFile(path.join(__dirname, '../client/app/index.html'));
    });

    app.use('/console/',express.static(path.join(__dirname, '../client')));
    app.use('/console/',express.static(path.join(__dirname, '../client/app')));

    // This will change in production since we'll be using the dist folder
    app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));



    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err.stack);
        res.send({
            message: err.message,
            error: err
        });
    });

    app.use(test);
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {

    // changes it to use the optimized version for production
    app.get('/',function(req,res){
        res.sendFile(path.join(__dirname, '../client/app/welcome.html'));});

    app.get('/console/',function(req,res){
        res.sendFile(path.join(__dirname, '../client/app/index.html'));});

    app.use('/console/',express.static(path.join(__dirname, '../client')));
    app.use('/console/',express.static(path.join(__dirname, '../client/app')));
    app.use(express.static(path.join(__dirname, '../client')));
    app.use(express.static(path.join(__dirname, '../client/app')));

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err.stack);
        res.send({
            message: err.message
        });
    });
}

app.use(function(req,res){
    _404.send(res);
});

module.exports = app;
