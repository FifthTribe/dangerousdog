var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse/node');
Parse.initialize(process.env.PARSEAPPID, process.env.PARSEJSKEY);

module.exports.pullData = function(req, res){

  // The URL to scrape
  var url = 'https://dd.va-vdacs.com/public/public.cgi?sysdogno=1161&submit=detail';

  // Get the URL
  request(url, function(error, response, html){

    if(!error) {

      // Get the HTML from cheerio
      var $ = cheerio.load(html);

      var Dog = Parse.Object.extend("Dog");
      var dog = new Dog();

      // Get the owner info (address)
      $('#ajaxcontentOwner').filter(function(){

        var ownerData = $(this);
        var ownerAddress = $('p',ownerData).get(2);

        // Loop though each child object of the p tag object to get the text
        for (var x = 0; x < ownerAddress.children.length; x++){
          var ownerInfoItem = ownerAddress.children[x];
          if (ownerInfoItem.type === "text"){
            var ownerDetails = ownerInfoItem.data.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");

            // Owner name
            if ( x === 2){
              dog.set("owner",ownerDetails);
            }

            // Street address
            if ( x === 4){
              dog.set("streetAddress",ownerDetails);
            }

            // City, state zip
            if ( x === 6 ){
              dog.set("cityStateZip",ownerDetails);
            }

          }
        }



      });

      $('#ajaxcontentDog').filter(function(){

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
            dog.set("county",countNumberText[0]));
            dog.set("numberText",countNumberText[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, ""));
            dog.set("number",parseInt(countNumberText[1].match(/\d/g).join('')));
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
              dog.set("name",dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, ""));
            }
            if ( dogDetails[0] === 'Primary Breed'){
              dog.set("primaryBreed",dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, ""));
            }
            if ( dogDetails[0] === 'Secondary Breed'){
              dog.set("secondaryBreed",dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, ""));
            }
            if ( dogDetails[0] === 'Color and Markings'){
              dog.set("colorAndMarkings",dogDetails[1].replace(/\s+/g, " ").replace(/^\s|\s$/g, ""));
            }
          }
        }

      });


      dog.save(null, {
        success: function(dog) {
          // Execute any logic that should take place after the object is saved.
          console.log('New object created with objectId: ' + dog.id);
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          console.log('Failed to create new object, with error code: ' + error.message);
        }
      });

      res.send('got dog info:<br />'+JSON.stringify(dog));

    } else {
      console.log('error',error);
      res.send('Error:<br />'+error);
    }
  });

}
