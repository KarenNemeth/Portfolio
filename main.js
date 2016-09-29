const http = require('http');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var property = chalk.cyan;
var url;
var inside = false;

http.createServer(function(request, response){
    var body = [];
    request.on('error',function(err){
        console.error(error("Request error:" + err));
    }).on('data', function(chunk){
        body.push(chunk);
    }).on('end', function(){
        if (request.method != "GET") {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });
            console.log(error("Method used:" + request.method));
            response.end("<!doctype html><html><h1>Request Not Allowed.</h1></html>");
        } else {
            if (inside){
                var contentURL = path.join(url, request.url);
                console.log(contentURL);
                var mimeTypes = {
                    '.html': 'text/html',
                    '.js': 'application/javascript',
                    '.css': 'text/css',
                    '.gif': 'image/gif',
                    '.jpg': 'image/jpeg',
                    '.png': 'image/png',
                    '.svg': 'image/svg+xml',
                    '.mp3': 'audio/mpeg3',
                    '.mp4': 'video/mp4',
                    '.ttf': 'application/octet-stream',
                    'else': 'text/plain'
                };
                var mimetype = mimeTypes[path.extname(contentURL)];
                response.setHeader('Content-Type', mimetype);
                var stream = fs.createReadStream(contentURL);
                stream.pipe(response);
            } else {
                url = "./Projects" + request.url;
                fs.exists(url, (exists) => {
                    if (exists) {
                        console.log("exists");
                        if (request.url == "/") {
                            response.writeHead(404, {
                                'Content-Type': 'text/html'
                            });
                            console.log(error("Project " + request.url + " does not exist."));
                            response.end("<!doctype html><html><h1>Please search for a specific project.</h1></html>");
                        } else {
                            fs.readdir(url, function(err, files){
                                if(err){
                                    console.log(error(err));
                                    process.exit();
                                }
                                files.forEach(function(file){
                                    if (path.extname(file) == '.html'){
                                        inside = true;
                                        console.log("inside set to " + inside);
                                        var fileURL = path.join(url, file);
                                        response.setHeader('Content-Type', 'text/html');
                                        var stream = fs.createReadStream(fileURL);
                                        stream.pipe(response);
                                    }
                                });
                            });
                        }
                    } else {
                        response.writeHead(404, {
                            'Content-Type': 'text/html'
                        });
                        console.log(error("Project " + request.url + " does not exist."));
                        response.end("<!doctype html><html><h1>Project does not exist.</h1></html>");
                    }
                });
            }
        }
    });
    response.on('error', function(err){
        console.error(error("response error:" + err));
    });
}).listen(8080, console.log("I'm listening on port 8080!"));
