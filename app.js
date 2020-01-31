const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const uuid = require('uuid')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const fs = require('fs')

const config = require('./config/index');
const routes = require('./routes/index');
const commonApi = require('./routes/common/common');

const app = express();
// process.env.UV_THREADPOOL_SIZE=64;
// console.log(process.env.UV_THREADPOOL_SIZE)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
// 自定义token
logger.token('from', function (req, res) {
  return req.query.from || '-';
});

// log only 4xx and 5xx responses to console
// app.use(logger('combined'))

logger.format('joke', `[:date[clf] ]-(${uuid.v1()})(xjwap,:url,:response-time,node,S)`);

// log all requests to access.log
if (process.env.NODE_ENV) {
  app.use(logger('joke', {
    stream: fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' }),
    skip: function (req, res) {
      return (new RegExp("^\/(stylesheets|javascripts|images|favicon)+.*$").test(req.path));
    }
  }))
}

// (traceId)(appName, url, costTime, framName, resultCode)
// 自定义format，其中包含自定义的token
// logger.format('joke', `(${uuid.v1()})(xjwap , :url , :response-time ms , :method , :status , :from)`);

// app.use(logger('joke'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: false
// }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置 Session
app.use(session({
  resave: true,
  saveUninitialized: false,
  store: new RedisStore({
    host: config.redis.host,
    pass: config.redis.password,
    port: config.redis.port,
    ttl: 8 * 60 * 60 // 过期时间
  }),
  secret: 'sendinfo'
}));

app.use(flash());

app.use('/*', function (req, res, next) {
  // (8e7c04ebb7dc46059703fa8c2c255b43)(xjwap, /demoServiceAction,1000,node,S)
  if (!req.session.member) {
    req.session.member = {
      id: ''
    }
  }
  //spread_code 扫码传入 promoteCode用户提交自带；
  if (req.query.spread_code || req.query.promoteCode) {
    let spreadCode = req.query.spread_code || req.query.spreadCode;
    let marketDisAccount = spreadCode.split('-')[1];
    req.session.marketDisAccount = marketDisAccount;
    req.session.spreadCode = spreadCode;
  }

  next();
});

app.use('/', routes);

// app.get('/vue/*', function (req, res) {
//   const html = fs.readFileSync(path.resolve(__dirname, './public/vue/index.html'), 'utf-8')
//   res.send(html)
// })

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (!new RegExp("\/(stylesheets|javascripts|images|favicon)+.*$").test(req.path)) {
    var err = new Error('Not Found');
    err.status = 404;
    commonApi.renderPage(req,res,'error404',{
      title: '404',
      merchantInfoId: req.query.m_id || req.session.merchantInfoId
    })
  }
  // next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    commonApi.renderPage(req,res,'error',{
      message: err.message,
      error: err
    })
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  console.log(`node error:: status:${err.status},message:${err.message}`);
  res.status(402);
  commonApi.renderPage(req,res,'error',{
    title: '错误页',
    message: err.message,
    error: {}
  })
});


module.exports = app;
