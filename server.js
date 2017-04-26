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



app.get('/imagesearch/*', function(req, res) {
  
});

app.get('/history', function(req, res) {
   
});

app.listen(PORT, function (){
    console.log('Listening on port ' + PORT);
});
  