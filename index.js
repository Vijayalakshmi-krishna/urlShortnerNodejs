const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoClient = require('mongodb');
//const validurl=require('valid-url');
//const url="mongodb://localhost:27017"

//const port=3000;
const port=process.env.PORT;
const url = "mongodb+srv://admin:passw0rd@mongo-productcatalog-roxs3.mongodb.net/urlShortnerDB?retryWrites=true&w=majority"
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.options("/*", function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});



app.post('/generateURL', function (req, res) {

    var random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    console.log(random_string);


    let urlshortData = {
        'longurl': req.body.longurl,
        'description': req.body.description,
        'shorturl': random_string,
        'clickcount':0
    }
    
    
        mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
            if (err) throw err;
            var db = client.db("urlShortnerDB");

           
            db.collection("urlshortnerlist").insertOne((urlshortData), function (err, result) {
                if (err) throw err;               
                res.send(urlshortData);
                client.close();
               
            });
        });

});



app.get('/getallurl', function (req, res) {
    //console.log(req.body);

    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("urlShortnerDB");
        var urlData = db.collection("urlshortnerlist").find().toArray();
        urlData.then(function (data) {
           
            client.close();
            res.json(data);
        })
            .catch(function (err) {
                client.close();
                res.json({
                    message: "Error in display"
                })
            })
    });

});

app.get('/:id', function (req, res) {
    console.log(req.params.id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("urlShortnerDB")
        var resData=db.collection("urlshortnerlist").findOneAndUpdate({ shorturl: req.params.id },{$inc:{clickcount:1}});            
        
        resData.then(function(data){
           // client.close();         
            res.redirect(data.value.longurl);
        })
        .catch(function(err){
            client.close();
            res.json({
                message:"Error"
            })
        })

});
});

app.delete("/deleteurl/:id",function(req,res){
    console.log(req.params.id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("urlShortnerDB");
        db.collection("urlshortnerlist").deleteOne({ shorturl: req.params.id }, function (err, result) {
            if (err) throw err;
            
            client.close();
            res.json({
                message: "deleted in DB"
            })
        });
    });
})



app.listen(port, function () {
    console.log("port is running at ",port);
})