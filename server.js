var unirest = require('unirest');
var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;
var mongoUrl = process.env.MONGOLAB_URI;

app.get('/api/imagesearch/:searchterm',function(req, res){
    var offset = req.query.offset;
    var reqTime = new Date().toISOString();
    var searchTerm = req.params.searchterm;
    console.log(searchTerm+" and offset: "+offset+"json to mongo: "+reqTime);
    

    mongo.connect(mongoUrl, function(err, db){
        if(err) throw err;
       db.collection('imageSearchTimes').insert({term : searchTerm, when : reqTime}, function(err, result){
           if(err) throw err;
           console.log(result);
       }); 
    });
    
    getUnsplashRequest(searchTerm, offset, function(err,response){
        if(err) throw err;
        var jsonResponse =[];
        response.results.forEach(function(r){
            jsonResponse.push({photographer : r.user.first_name+" "+r.user.last_name ,link_to_site: r.links.html ,url_full : r.urls.full, url_thumb : r.urls.thumb})
        })
        res.send(JSON.stringify({total : response.total, total_pages : response.total_pages, responses : jsonResponse}));
    })    

});



app.get('/api/latest/imagesearch',function(req, res){
    mongo.connect(mongoUrl, function(err, db){
        if(err) throw err;
       db.collection('imageSearchTimes').find({},{_id:0}).sort({when:-1}).toArray(function(err, result){
           if(err) throw err;
           res.send(result);
       }); 
    });
});


function getUnsplashRequest(searchTerm, page, callback){
    unirest.get('https://api.unsplash.com/search/photos')
      .query({'query': searchTerm})
      .query({page : page})
      .query({'client_id': process.env.UNSPLASH_CLIENT_ID})
      .end(function(res) {
        if (res.error) {
          console.log('GET error', res.error)
          callback(true, res.error)
        } else {
          console.log('GET response', res.body)
          callback(null, res.body)
        }
      })
}

app.listen(process.env.PORT);