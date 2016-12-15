#!/usr/bin/env node

var program = require('commander');
var fs = require("fs");
var TasteeCore = require("tastee-core/src/app/tastee-core");
var TasteeReporter = require("tastee-core/src/app/tastee-reporter");
var TasteeEngine = require("tastee-core/src/app/tastee-engine");
var TasteeAnalyser = require("tastee-core/src/app/tastee-analyser");

program
    .arguments('<tastee script file>')
    .option('-i, --instructions <instruction files>', 'Custom instruction files separated with semicolons')
    .option('-p, --parameters <parameter files>', 'Custom parameter files separated with semicolons')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)')
    .option('-p, --path <path>', 'Path is path where rapport generated')
    .option('-r, --reporter <reporter>', 'Select the desired report between : junit')
    .action(function (file) {
        console.log('   ***   ')

        var browser = 'chrome';
        if (program.browser) {
            browser = program.browser;
        }    

        var reporter='html';
        if (program.reporter) {
            reporter = program.reporter;
        }

        var path = './tastee-reporting';
        if (program.path) {
            path = program.path;
        }  

        var engine = new TasteeEngine.TasteeEngine(browser, path);
        var core = new TasteeCore.TasteeCore(engine, new TasteeAnalyser.TasteeAnalyser());
        var tasteeReporter = new TasteeReporter.TasteeReporter();

        if (program.instructions) {
            program.instructions.split(";").forEach(function (filePath) {
                core.addPluginFile(filePath);
            });
            console.log('instructions  : '+ program.instructions);
        }
        if (program.parameters) {
            program.parameters.split(";").forEach(function (filePath) {
                core.addParamFile(filePath);
            });
            console.log('parameters : '+ program.parameters);
        }

        console.log('browser       : '+browser);
        console.log('reporter path : '+path);
        console.log('   ***   ')


        fs.readFile(file, "utf8", function (err, data) {
            if (!err) {
                console.log('Started ...')
                core.execute(data).then(function (instructions) {
                    switch (reporter) {
                        case "junit": tasteeReporter.generateJunitReporter(instructions); break;
                        case "html":  tasteeReporter.generateHtmlReporter(path,file.split('.')[0],instructions);break;
                    }
                    console.log('... Finished !')
                });;
                core.stop();
            } else {
                console.error(err);
            }
        });
    })
    .parse(process.argv);