const https = require('https');
const twitterCredentials = require('./credentials.json');
const key = twitterCredentials.key;
const secret = twitterCredentials.secret;
const express = require('express');
const app = express();
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var property = chalk.cyan;
var note = chalk.green;

const code = key.concat(":", secret);
const code64 = new Buffer(code).toString('base64');

app.use(express.static(__dirname));
console.log(__dirname);
app.get('/', function(reqg, resg){
    const options1 = {
        host: "api.twitter.com",
        path: "/oauth2/token",
        method: "POST",
        headers: {
            Authorization: "Basic " + code64,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Content-Length": 29
        }
    };
    var token;
    var tokenData;
    var timeline = "";
    var tweetsToDisplay = [];
    const req1 = https.request(options1, function(res) {
        res.on('data', function(data) {
            try {
                tokenData = JSON.parse(data);
            } catch(err){
                console.log(error("Error when receiving Bearer Token: " + err));
            }
            const tokenType = tokenData["token_type"];
            token = tokenData["access_token"];
            if (tokenType != "bearer") {
                console.error(error("Bearer Token No Longer Valid"));
                return;
            } else {
                console.log(note("Valid Bearer Token Received"));

                const options2 = {
                    host: "api.twitter.com",
                    path: "/1.1/statuses/user_timeline.json?count=40&screen_name=TheEconomist",
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                };
                const req2 = https.request(options2, function(res){
                    res.on('data', function(chunk){
                        timeline += chunk;
                    }).on('end', function(){
                        timeline = JSON.parse(timeline);
                        timeline.filter(function(entry){
                            try {
                                return entry.text.match(/http/g).length == 1;
                            } catch (err) {
                                console.log(error("Link not existent in this tweet"));
                            }
                        }).forEach(function(entry){
                            var tweetarray = entry.text.split(" http");
                            var tweet = {};
                            tweet["title"] = tweetarray[0];
                            tweet["link"] = ('http' + tweetarray[1]);
                            tweetsToDisplay.push(tweet);
                            console.log(tweetsToDisplay);
                            //Get this to the client side
                        });
                        resg.render('ticker', {
                            links: tweetsToDisplay
                        });
                    });
                }).on('error', function(e) {
                    console.error(error(e));
                });
                req2.end();
            }
        });
    }).on('error', function(e) {
        console.error(error(e));
    });
    req1.write("grant_type=client_credentials");
    req1.end();
});
app.listen(8080, function(){
    console.log("I'm listening!");
});
