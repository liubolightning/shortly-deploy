var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

// var db = require('../app/config');
var db = require('../app/mongoConfig');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {

  //find all
  db.Url.find({}, function(err, result){
    if(err) return console.log(err);
    //on success, send all as array
    // console.log("Fetch result: ", result);
    res.send(200, result);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });

  db.Url.find({url: uri}, function(err, result){
    console.log("i am the RESULT FROM MONGO: ", result);
    if (result.length > 0){
      console.log("url already exists");
      //res.send200
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          // return res.send(404);
          return;
        }
        var linkDetails = {
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visits: 0
        };

        var link = new db.Url(linkDetails);
        link.save(function(err){
          console.log("new link saved");
          // res.send(200, linkDetails);
        });
        // link.save().then(function(newLink) {
        //   Links.add(newLink);
        //   res.send(200, newLink);
        // });
      });
    }
  });



};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });

  //find user
    //if not found
      // redirect -> login
    //if found
      //bcrypt.compare(password, result.password, function(err, result){
      //  if(result)
        //  util.createSession(req, res, user);
      //  else
      //    redirect -> login
      //});
      //
  db.User.findOne({username: username}, function(err, result){
    if (!result){
      console.log("NOTHING WAS FOUND");
      res.redirect('/login');
    } else {
      bcrypt.compare(password, result.password, function(err, match) {
        console.log("INPUT PW: ", password, "DB HASH: ", result.password);

        if (match) {
          util.createSession(req, res, result);
        } else {
          console.log("comparison did not match for pw");
          res.redirect('/login')
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })

  // find a user
  db.User.findOne({username: username}, function(err, result){
    // if found
    if(err) return console.log(err);
    if(result){
      console.log('Account already exists');
      res.redirect('/signup');
    }else{
      var salt = bcrypt.genSaltSync(2);
      var hashedPw = bcrypt.hashSync(password, salt);

      var userDetail = {
        username: username,
        password: hashedPw
      };

      var user = new db.User(userDetail);
      user.save(function(err){
        console.log('New user saved.')
        util.createSession(req, res, userDetail);
      });
    }

  });
    // redirect -> /signup
  // if not found
    // bcrypt hash the password
    // create a new user with the hashed password
    // createSession

};

exports.navToLink = function(req, res) {
  //search database with code from request
  db.Url.findOne({code: req.params[0]}, function(err, url){
    if(err) return console.log(err);
    // console.log("XXXXXXXXX MONGO URL:", url);
    //if no code is found
    if(!url){
      //res.redirect - to  - '/'
      res.redirect('/');
    }else{
      // var current
      url.update({$set: {visits: url.visits + 1}}, function(){
        // console.log("url visits updated in mongo.");
        res.redirect(url.url);
      });
    }
  });


};
