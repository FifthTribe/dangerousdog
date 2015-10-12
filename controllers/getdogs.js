var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse/node');
Parse.initialize(process.env.PARSEAPPID, process.env.PARSEJSKEY);

module.exports.pullData = function(req, res){

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

        var dog = {};

        // Get the entire DOM
        var data = $(this);

        // Get the county and the number of dog
        var countyDogNumberInfo = $('p span.body3',data).get(0);

        //Loop through each child object of the p tag with the county and number of dog and get the text
        for (var x = 0; x < countyDogNumberInfo.children.length; x++){
          var countyDogNumberInfoItem = countyDogNumberInfo.children[x];
          if (countyDogNumberInfoItem.type === "text"){
            // The text will be split by a :
            var countNumberText = countyDogNumberInfoItem.data.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").split(':');
            dog.county = countNumberText[0];
            dog.number = countNumberText[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
            dog.id = parseInt(countNumberText[1].match(/\d/g).join(''));
          }
        }

        // Get the p tag with the dog information
        var dogInfoParagraph = $('p',data).get(2);

        // Loop though each child object of the p tag object to get the text
        for (var x = 0; x < dogInfoParagraph.children.length; x++){
          var dogInfoItem = dogInfoParagraph.children[x];
          if (dogInfoItem.type === "text"){
            var dogDetails = dogInfoItem.data.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").split(':');
            if ( dogDetails[0] === 'Name of Dangerous Dog'){
              dog.name = dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
            }
            if ( dogDetails[0] === 'Primary Breed'){
              dog.primaryBreed = dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
            }
            if ( dogDetails[0] === 'Secondary Breed'){
              dog.secondaryBreed = dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
            }
            if ( dogDetails[0] === 'Color and Markings'){
              dog.colorAndMarkings = dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
            }
          }
        }

        res.send('got dog info:<br />'+JSON.stringify(dog));
      });

    } else {
      console.log('error',error);
      res.send('Error:<br />'+error);
    }
  });
