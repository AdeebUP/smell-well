const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const db=require('./config/connection')
const session = require('express-session')
const nocache=require('nocache')
const dotenv = require('dotenv')
dotenv.config()

// const indexRouter = require('./routes/index');
const userRouter = require('./routes/user/user');
const adminRouter = require('./routes/admin/admin')

const app = express();
// const fileUpload = require('express-fileupload')


// view engine setup
app.engine('hbs', hbs.engine(({helpers:{
  inc: function (value, options){
    return parseInt(value) +1;
  }
  // adminDir:__dirname+'/views/admin  '
},extname:'hbs', defaultLayout:'main-layout', layoutDir:__dirname+'/views/layouts',partialsDir:__dirname+'/views/partials/'})))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Key", resave: true, saveUninitialized: true, cookie:{maxAge:60000000}}))
app.use(nocache())




db.connect((err)=>{
  if(err) console.log("Connection Error"+err);
  else console.log("Database Connected to port 27017");
})


app.use('/',userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('pages-error')
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
