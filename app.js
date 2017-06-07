// Require express
const express = require('express');

// Require Body Parser
const bodyParser = require('body-parser');

//Bring in Express Validator, flash, session
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

// Bring in passport
const passport = require('passport');

//Bring in config database
const config = require('./config/database');

// Port Setting
const PORT = process.env.PORT || 3000;

// Require Path
const path = require('path');

// Bring in mongoose
const mongoose = require('mongoose');

// Connect to our database
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', function (){
  console.log('Connected to MongoDB');
})

// Check for DB errors
db.on('error', function(err){
  console.log(err);
})

// Init app
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname,'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Create an Enable global user variable
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route (Home Page, first page loads at Port)
app.get('/', function (req, res){
   Article.find({}, function(err, articles){
     if(err){
       console.log(err);
     } else {
       res.render('index', {
         title: 'Articles',
         articles: articles
       });
     }
   });
});

// Router Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start server and listen...
app.listen(PORT, function(){
  console.log('Server started on port ' + PORT +'...');
})
