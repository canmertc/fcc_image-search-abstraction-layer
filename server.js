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
    
    res.end("ok");
});



app.get('/api/latest/imagesearch',function(req, res){

    mongo.connect(mongoUrl, function(err, db){
        if(err) throw err;
       db.collection('imageSearchTimes').find({},{_id:0}).toArray(function(err, result){
           if(err) throw err;
           res.send(result);
       }); 
    });
    
})


app.listen(process.env.PORT);