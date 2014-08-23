var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shortly')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('database connection success.');

  var Schema = mongoose.Schema;

  var userSchema = new Schema({
    username:  String,
    password: String,
    date: { type: Date, default: Date.now }
  });

  var urlSchema = new Schema({
    url: String,
    baseUrl: String,
    code: String,
    title: String,
    visits: Number,
    date: { type: Date, default: Date.now }
  });

  var User = mongoose.model('User', userSchema);
  var Url = mongoose.model('Url', urlSchema);

});

module.exports = db;





// var Schema = mongoose.Schema;

// var userSchema = new Schema({
//   username:  String,
//   password: String,
//   date: { type: Date, default: Date.now }
// });

// var User = mongoose.model('User', userSchema);

// var Jack = new User({username: 'Jack', password: 'Jack'});

// Jack.save(function(err){
//     if(err) return console.log(err);
//     console.log("Success");
// });

// var urlSchema = new Schema({
//   url: String,
//   baseUrl: String,
//   code: String,
//   title: String,
//   visits: Number,
//   date: { type: Date, default: Date.now }
// });

// var Url = mongoose.model('Url', urlSchema);

// var Google = new Url({url: 'www.google.com',
//                       baseUrl: 'sdgsgsgsg',
//                       code: 'sdgsgsg',
//                       title: 'Google',
//                       visits: 0});

// // Google.save(function(err){
// //     if(err) return console.log(err);
// //     console.log("Google Saved");

//     Url.find({}, function (err, results) {
//       if (err) return handleError(err);
//       console.log("This is the results of find query: ", results); // Space Ghost is a talk show host.
//       var google = results[0];
//       console.log("vists for google: ", google.visits);
//       var newVisits = google.visits +1;
//       google.update({$set: {visits: newVisits}}, function(err){
//         Url.find({}, function(err, results){
//           console.log("google should have 1 visit: ", results)
//         })
//       });

//       // Url.update({title: 'Google'}, { code: 'I HAVE CHANGED'}, function(err, numberAffected){
//       //   if (err) return handleError(err);
//       //   console.log("number of affected doc: ", numberAffected);
//       //   Url.find({}, function(err, results){
//       //     if (err) return handleError(err);
//       //     console.log("RESULTS AFTER UPDATE: ", results);
//       //   })
//       // })
//     // })
// });


