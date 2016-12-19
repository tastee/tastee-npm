#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var TasteeCore = require('tastee-core/src/app/tastee-core');
var TasteeReporter = require('tastee-core/src/app/tastee-reporter');
var TasteeEngine = require('tastee-core/src/app/tastee-engine');
var TasteeAnalyser = require('tastee-core/src/app/tastee-analyser');
var path = require('path');
var glob = require("glob")

program
    .arguments('<tastee script file>')
    .option('-i, --instructions <instruction files>', 'Custom instruction files separated with semicolons')
    .option('-c, --conf <parameter files>', 'Custom parameter files separated with semicolons')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)')
    .option('-p, --path <path>', 'Path is path where rapport generated')
    .option('-r, --reporter <reporter>', 'Select the desired report between : junit')
    .action(function (file) {
        var browser = 'chrome';
        if (program.browser) {
            browser = program.browser;
        }

        var reporter = 'html';
        if (program.reporter) {
            reporter = program.reporter;
        }

        var reportingPath = './tastee-reporting';
        if (program.path) {
            reportingPath = program.path;
        }

        var engine = new TasteeEngine.TasteeEngine(browser, reportingPath);
        var core = new TasteeCore.TasteeCore(engine, new TasteeAnalyser.TasteeAnalyser());
        var tasteeReporter = new TasteeReporter.TasteeReporter();


        if (fs.lstatSync(file).isFile()) {
            console.log('Lancement d un fichier unitaire')
            if (program.instructions) {
                program.instructions.split(";").forEach(function (filePath) {
                    core.addPluginFile(filePath);
                });
                console.log('instructions  : ' + program.instructions);
            }

            if (program.conf) {
                program.conf.split(";").forEach(function (filePath) {
                    core.addParamFile(filePath);
                });
                console.log('conf : ' + program.parameters);
            }
            fs.readFile(file, "utf8", function (err, data) {
                if (!err) {
                    console.log('Started ...')
                    core.execute(data).then(function (instructions) {
                        switch (reporter) {
                            case "junit": tasteeReporter.generateJunitReporter(instructions); break;
                            case "html": tasteeReporter.generateHtmlReporter(reportingPath, path.basename(file,".tee"), instructions); break;
                        }
                        console.log('... Finished !')
                    });;
                    core.stop();
                } else {
                    console.error(err);
                }
            });
        } else {
            console.log('Started ...')
            glob(path.join(file, "**", "+(*.conf|*.param).tee"),{symlinks: true}, function (err, filenames) {
                filenames.forEach(function (filename) {
                    if(filename.search('/\.conf\.tee/')){
                        console.log('Add plugin file :'+path.join(file,filename))
                        core.addPluginFile(path.join(file,filename));
                    }else{
                        console.log('Add param file :'+path.join(file,filename))
                        core.addParamFile(path.join(file,filename));
                    }
                });
            });
            glob(path.join(file, "**", "!(*.conf|*.param).tee"),{symlinks: true}, function (err, filenames) {
                filenames.forEach(function (filename) {
                    fs.readFile(path.join(file,filename), "utf8", function (err, data) {
                        if (!err) {
                            console.log('Starting  :'+filename);
                            core.execute(data).then(function (instructions) {
                                switch (reporter) {
                                    case "junit": tasteeReporter.generateJunitReporter(instructions); break;
                                    case "html": tasteeReporter.generateHtmlReporter(reportingPath, path.basename(filename,".tee"), instructions); break;
                                }
                                console.log('Finished :'+filename);
                            });;
                            core.stop();
                        } else {
                            console.error(err);
                        }
                    });

                });
            });
        }
        
        console.log('   ***   ')
        console.log('browser       : ' + browser);
        console.log('reporter path : ' + reportingPath);
        console.log('   ***   ')


    })
    .parse(process.argv);