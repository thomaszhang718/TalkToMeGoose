/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request');
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

// set up handlebars default layout and view engine
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// Database configuration with mongoose
mongoose.connect('mongodb://heroku_jl44mddw:hkof2uhae3sicsa7d0sdn5os3v@ds145385.mlab.com:45385/heroku_jl44mddw');
//mongoose.connect('mongodb://localhost/mongoosehw');

var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  //render home.handlebars
  res.render('home');
});

// A POST request to scrape the NYtimes website.
app.post('/fetch', function(req, res) {
	// first, we grab the body of the html with request
	//console.log("got to fetch")

  request('http://www.nytimes.com/', function(error, response, html) {
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('article.story.theme-summary').each(function(i, element) {

	// save an empty result object
		var result = {};

		// add the text and href of every link,
		// and save them as properties of the result obj
		result.title = $(element).find('.story-heading').find('a').text();
		result.summary = $(element).find('p.summary').text();

		// using our Article model, create a new entry.
		// Notice the (result):
		// This effectively passes the result object to the entry (and the title and link)
		var entry = new Article (result);

		// now, save that entry to the db
		entry.save(function(err, doc) {
			// log any errors
		  if (err) {
		    console.log(err);
		  }
		  // or log the doc
		  else {
		    console.log(doc);
		  }
		});
    });
  });
  // tell the browser that we finished scraping the text.
  res.send("Scrape Complete");
});

// this will get the articles we scraped from the mongoDB
app.get('/check', function(req, res){

	//console.log("got to check");

	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		}
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// save a new note
app.post('/save', function(req, res){

	//console.log("got to save")

	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	//console.log(req.body.id)

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		}
		// otherwise
		else {
			//send doc, which is the data of the new note
			res.send(doc);
		}
	});
});

// grabs all the notes saved for the article ID
app.post('/gather', function(req, res){

	//console.log("got to gather")

	//console.log(req.body.id)

	// grab every doc in the Note array with the id for the article you're currently on
	Note.find({'id': req.body.id}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		}
		// or send the doc to the browser as a json object
		else {
			//console.log(doc)
			res.json(doc);
		}
	});
});


// deletes all the notes that contain the 'id' (field for article id. '_id' is the note id) of the currently selected article
app.delete('/delete', function(req, res){

	//console.log("got to delete")

	//console.log(req.body)
	//console.log(req.body.id)

	Note.remove({'id': req.body.id})
	// execute the above query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} else {
			// or send the document to the browser
			//console.log(doc)
			res.send(doc);
		}
	});	
});


// set up port for heroku
var PORT = process.env.PORT || 3000;
// listen on port 3000
app.listen(PORT, function() {
  console.log('App running on port 3000!');
});