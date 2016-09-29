const fs = require('fs');
const Handlebars = require('handlebars');

var projectsURL = __dirname + "/Projects";
var projectsAvailable = fs.readdirSync(projectsURL);
var projects = [];


projectsAvailable.filter(function(file){
    return file[0] != ".";
}).forEach(function(projectDir){
    var projectName = projectDir.replace(/-/g, " ");
    var project = {
        "name": projectName,
        "link": projectDir
    };
    projects.push(project);
});

var context = {"projects": projects};
var data = fs.readFileSync('./projects.handlebars', 'utf-8');
var template = Handlebars.compile(data);
var html = template(context);
module.exports = html;
