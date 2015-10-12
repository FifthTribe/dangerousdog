process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// Scraper to scrape thd dog URLs
app.get('/getdogs', function(req, res){

  // The URL to scrape
  var url = 'https://dd.va-vdacs.com/public/public.cgi?sysdogno=1161&submit=detail';

  // Get the URL
  request(url, function(error, response, html){
    //console.log('response',response);

    if(!error) {

      // Get the HTML from cheerio
      var $ = cheerio.load(html);

      // Finally, we'll define the variables we're going to capture
      var title, release, rating;
      var json = { title : "", release : "", rating : ""};

      $('#ajaxcontentDog').filter(function(){

        // Var dogs
        var dogs = [];

        // Get the entire DOM
        var data = $(this);

        // Get the p tag with the dog information
        var dogInfoParagraph = $('p',data).get(2);

        // Loop though each child object of the p tag object to get the text
        for (var x = 0; x < dogInfoParagraph.children.length; x++){
          var dogInfoItem = dogInfoParagraph.children[x];
          var dog = [];
          if (dogInfoItem.type === "text"){
            dog.push(dogInfoItem.data);
          }
          dogs.push(dog);
        }
        res.send('got dog info:<br />'+dogs);
      });

    } else {
      console.log('error',error);
    }
  })


})

app.listen('8080')
exports = module.exports = app;
