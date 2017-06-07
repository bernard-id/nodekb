const express = require('express');
const router = express.Router();

// Bring in Article Model from models folder
let Article = require('../models/article');
// Bring in User Model from models folder
let User = require('../models/user');

// Add Route from Views for adding form
router.get('/add', ensureAuthenticated, function(req, res) {
  res.render('add_article', {
    title:'Add Article'
  });
});

// Add Submit POST Route from Views, and submit to databases
router.post('/add', function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title:'Add Article',
      errors:errors
    })
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','New Article Added');
        res.redirect('/');
        console.log('Form Added Success');
        console.log('Welcome '+req.body.title);
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      title:"Edit Article",
      article: article
    });
  });
});

// Update or Edit POST Route from Views, and submit to databases
router.post('/edit/:id', ensureAuthenticated, function(req,res){
  let article = {};
  article.title = req.body.title;
  //article.author = req.user.name;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success',req.body.title+' Updated');
      console.log(req.body.title+' Form updated');
      res.redirect('/');
    }
  });
});

// Delete Article
router.delete('/:id', ensureAuthenticated, function(req, res){
  if(!req.user._id){
    res.redirect('/');
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
      res.redirect('/');
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Delete Success');
        req.flash('danger','Article Id: '+req.params.id+' is Deleted');
        console.log(req.params.id+' Form Deleted')
      });
    }
  });
});

// Get Single Article Route
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login to access');
    res.redirect('/users/login');
  }
}

module.exports = router;
