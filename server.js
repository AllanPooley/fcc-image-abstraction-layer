
var express = require('express');
var app = express();
var path = require('path');
var https = require('https');
var request = require('request');

const PORT = 8080;
const CSE_URL = 'https://www.googleapis.com/customsearch/v1';
const CSE_SEARCH = 'image';
const CSE_CX = '005854168553956312373:rcwxvmrc8y8';
const CSE_KEY = 'AIzaSyCVbEX1KZJ9l7sceU7r1euXo_B82opZg9o';

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




app.get('/', function(req, res) {
  console.log("User hit @ Homepage");
  res.render('index'); 
  
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname, 'favicon.png'));
});



app.get('/search/:search*', function(req, res) {
  
  // Get search term
  var searchQuery = req.params.search
  
  // Get ?offset = query string value.
  var offset = 1;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
    
  console.log("Attempting image search on phrase: " + searchQuery + ', with an offset of ' + offset);
    
  searchForImages(searchQuery, offset, function(result) {
    if (result)
      res.send(result);
    else
      res.send({"error" : "Unable to perform search."})
  });
  
  
});

app.get('/history', function(req, res) {
  console.log("User hit @ History");
});

app.listen(PORT, function (){
  console.log('Listening on port ' + PORT);
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
function saveSearch(term) {
  return true;
}

// Retrieves saved search history from the database, returning the most recently
// saved documents.
function getRecentSearch(){
  return [];
}

