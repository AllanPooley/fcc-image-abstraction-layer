var express = require('express');
var app = express();
var path = require('path');

var PORT = 8080;

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.get('/', function(req, res) {
  
  res.render('index'); 
  
});



app.get('/imagesearch/:target*', function(req, res) {
  
  // Get search term
  // Get ?offset = query string value.
  
  
  
});

app.get('/history', function(req, res) {
   
});

app.listen(PORT, function (){
    console.log('Listening on port ' + PORT);
});



// Connects to a search engine API and retrieves images that match the given term.
function searchForImages(term, offset){
  
}

// Saves a search term along with the current DateTime to a database.
function saveSearch(term) {
  
}

// Retrieves saved search history from the database, returning the most recently
// saved documents.
function getRecentSearch(){
  
}

