/**
 * Module dependencies.
 */
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
//var logFile = fs.createWriteStream('./nodeLogFile.log', {flags: 'a'});

var express = require('express');
var routes = require('./routes');

//var mongodbAlert = require('./routes/mongodbAlert');
//var mongoStatus = require('./routes/sys_mongoShell');
//var sys_mongo = require('./routes/sys_mongo');
//var sys_alert = require('./routes/sys_alert');
//var cdr_mongo = require('./routes/cdr_mongo');
//var cdr_2g_mongo = require('./routes/cdr_2g_mongo');
//var cdr_gprs_mongo = require('./routes/cdr_gprs_mongo');
var cdr_gprs = require('./routes/cdr_gprs');
var lte_pgw = require('./routes/lte_pgw');

var util = require('util');
var http = require('http');
var path = require('path');

var settings = require('./settings');

//純粹當 session store，因為 monk 不知如何設定成express session
var MongoStore = require('connect-mongo')(express);

var monk = require('monk');
//var dbCDR = monk('172.17.24.196:27017/cdr');
//var dbCDR = monk('192.168.0.196:40000/cdr');
//var url = 'mongodb://127.0.0.1:27017/cep2';
//var dbCDR = MongoClient.connect(url);
var dbCDR = monk('mongodb://127.0.0.1:27017/cep_storm');
//var dbCDR = monk('127.0.0.1:27017/cep2');
//var dbCDR = monk('mognodb://172.27.21.14:40000/cep2');


var partials = require('express-partials');
var flash = require('connect-flash');

var sessionStore = new MongoStore({
	host: settings.host, //define this, otherwise it throws "Error: failed to connect to [1276.0.0.1:27017]"
	port: settings.port,
	db: settings.db
}, function () {
	console.log('connect mongodb success...');
});

var app = express();
//app.locals.inspect = require('util').inspect;
app.locals.util = require('util');
// all environments
app.set('port', process.env.PORT || 8088);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(partials());
app.use(flash());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
//app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookie_secret,
	cookie: {
		maxAge: 1000 * 60 * 20	//20 minutes
	},
	store: sessionStore
}));

app.use(express.static(path.join(__dirname, 'public')));
app.enable('trust proxy');
//app.use(express.logger({stream: logFile}));  //========logging========
app.use(app.router);


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
app.get('/', routes.index);

//================================================= G P R S ============================
//app.get('/cdr_gprs_query', cdr_gprs.index);
app.get('/cdr_gprs_raw_show', 	cdr_gprs.cdr_CRUD_show_pagging(dbCDR));
//app.get('/cdr_gprs_raw_show', 	cdr_gprs.cdr_gprs_raw_show(dbCDR));
app.get('/cdr_gprs_raw_query', 	cdr_gprs.cdr_gprs_raw_show(dbCDR));
app.post('/cdr_gprs_raw_query', cdr_gprs.cdr_gprs_raw_query(dbCDR));

//================================================= L T E 4G ============================
//app.get('/lte_pgw_query', lte_pgw.index);
app.get('/lte_pgw_raw_show', 	cdr_gprs.cdr_CRUD_show_pagging(dbCDR));
//app.get('/lte_pgw_raw_show', 	lte_pgw.lte_pgw_raw_show(dbCDR));
app.get('/lte_pgw_raw_query', 	lte_pgw.lte_pgw_raw_show(dbCDR));
app.post('/lte_pgw_raw_query', 	lte_pgw.lte_pgw_raw_query(dbCDR));

//app.get('/lte_pgw_agg_query', 	lte_pgw.lte_pgw_agg_show(dbCDR));
//app.post('/lte_pgw_agg_query', 	lte_pgw.lte_pgw_agg_query(dbCDR));


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
