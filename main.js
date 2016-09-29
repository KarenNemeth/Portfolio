const http = require('http');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const chalk = require('chalk');
var html = require("./handlebarsModule.js");
var error = chalk.bold.magenta;
var url;
var projectInQuestion;

http.createServer(function(request, response){
    var body = [];
    request.on('error',function(err){
        console.error(error("Request error:" + err));
    }).on('data', function(chunk){
        body.push(chunk);
    }).on('end', function(){
        if (request.method == "GET") {
            if (request.url == "/") {
                response.setHeader('Content-Type', 'text/html');
                response.end(html);
            } else {
                url = "./Projects" + request.url;
                fs.exists(url, (exists) => {
                    if (exists) {
                        fs.readdir(url, function(err, files){
                            if(err){
                                console.log(error(err));
                                process.exit();
                            }
                            files.forEach(function(file){
                                if (path.extname(file) == '.html'){
                                    projectInQuestion = url;
                                    var fileURL = path.join(url, file);
                                    response.setHeader('Content-Type', 'text/html');
                                    var stream = fs.createReadStream(fileURL);
                                    stream.pipe(response);
                                }
                            });
                        });
                    } else {
                        var contentURL = path.join(projectInQuestion, request.url);
                        fs.exists(contentURL, (exists) => {
                            if (exists) {
                                var mimetype = mime.lookup(contentURL);
                                response.setHeader('Content-Type', mimetype);
                                var stream = fs.createReadStream(contentURL);
                                stream.pipe(response);
                            } else {
                                response.writeHead(404, {
                                    'Content-Type': 'text/html'
                                });
                                console.log(error("Project " + request.url + " does not exist."));
                                response.end("<!doctype html><html><h1>Project does not exist.</h1></html>");
                            }
                        });
                    }
                });
            }
        } else {
            response.writeHead(404, {'Content-Type': 'text/html'});
            console.log(error("Method used:" + request.method));
            response.end("<!doctype html><html><h1>Request Not Allowed.</h1></html>");
        }
        if (request.url == "/crash") {
            console.log(error(error));
        }
    });
    response.on('error', function(err){
        console.error(error("response error:" + err));
    });
}).listen(8080, console.log("I'm listening on port 8080!"));
