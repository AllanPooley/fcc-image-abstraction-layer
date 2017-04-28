
var express = require('express');
var app = express();
var path = require('path');
var https = require('https');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;

const PORT = 8080;
const CSE_URL = 'https://www.googleapis.com/customsearch/v1';
const CSE_SEARCH = 'image';
const CSE_CX = '005854168553956312373:rcwxvmrc8y8';
const CSE_KEY = 'AIzaSyCVbEX1KZJ9l7sceU7r1euXo_B82opZg9o';
const RESULTS_PER_PAGE = 10;

const DB_NAME = 'image-seeker';
const DB_USER = 'quincy';
const DB_PASS = 'larson';
var DB_URL = 'mongodb://' + DB_USER + ':' + DB_PASS + '@ds123361.mlab.com:23361/' + DB_NAME;
const DB_COLLECTION_NAME = 'history';

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var db;

// Initialising connection to database and starting server.
MongoClient.connect(DB_URL, function (err, database) {
  if (err) return console.log(err);
  
  db = database;
  app.listen(PORT, function (){
    console.log('Listening on port ' + PORT);
  });
  
});

app.get('/', function(req, res) {
  console.log("User hit @ Homepage");
  res.render('index'); 
  
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});



app.get('/search/:search*', function(req, res) {
  
  // Get search term
  var searchQuery = req.params.search;
  
  saveSearch(searchQuery);
  
  // Get ?offset = query string value.
  var offset = 1;
  if (req.query.offset)
    offset = parseInt(req.query.offset) * RESULTS_PER_PAGE; // * 10
    
  console.log("Attempting image search on phrase: " + searchQuery + ', with an offset of ' + offset);
    
  searchForImages(searchQuery, offset, function(result) {
    if (result)
      res.send(result);
    else
      res.send({"error" : "Unable to perform search."});
  });
  
  
});

app.get('/history', function(req, res) {
  
  getRecentSearch(function(recentHistoryArr) {
    
    if (recentHistoryArr)
      res.send(recentHistoryArr);
    else 
      res.send({error: "Unable to retrieve history."});
  });
  
});


// Connects to a search engine API and retrieves images that match the given term.
function searchForImages(query, offset, callback){
  
  request.get(buildQuery(query, offset), function(err, response) {
    if (err) {
      
      console.log("Error: " + err);
      callback(null);
      
    } else {
      
      var results = JSON.parse(response.body);
      
      if (results.items) {
        
        var images = [];
        
        for (var i = 0; i < results.items.length; i++) {
          
          images.push(pruneImage(results.items[i]));
          
        }
        callback(images);
        
      } else {
        
        callback(null);
        
      }
      
    }
  });
  
}


function buildQuery(searchQuery, offset) {
  
  return CSE_URL + '?' 
  + "key=" + CSE_KEY 
  + "&cx=" + CSE_CX 
  + "&searchType=" + CSE_SEARCH 
  + "&q=" + searchQuery 
  + "&start=" + offset;
  
}


// Trims the image payload is received from the Google CSE API to a smaller subset.
function pruneImage(item) {
  
  return { 
    
    "url": item.link, 
    "snippet": item.snippet, 
    "thumbnail": item.image.thumbnailLink, 
    "context": item.image.contextLink 
    
  };
  
}

// Saves a search term along with the current DateTime to a database.
function saveSearch(query) {
  
  // Creating a new search history doc with the query and time of search (now).
  var searchDoc = {
    term: query,
    when: new Date().toString()
  };
  
  db.collection(DB_COLLECTION_NAME).insert(searchDoc, function(err, result) {
    if (err) {
      console.log("Error: Failed to save search to history.");
    } else {
      console.log("Search for " + searchDoc.term + " at " + searchDoc.when + " saved to history.")
    }
  });
}

// Retrieves saved search history from the database, returning the most recently
// saved documents.
function getRecentSearch(callback){
  db.collection(DB_COLLECTION_NAME).find({}, { term: 1, when: 1, _id: 0 }).toArray(function(err, result) {
    if (err) {
      console.log(err);
      callback(null);
    } else {
      if (result.length >= 10) {
        result = result.slice(result.length - 10);
      }
      console.log("Recent Searches: ");
      console.log (result);
      callback(result);
    }
    
    
  });
}

