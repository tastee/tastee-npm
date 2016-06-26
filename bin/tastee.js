#!/usr/bin/env node

var program = require('commander');
var fs = require("fs");
var core = require("tastee-core");
var Reporter = require("tastee-core/app/tastee-reporter");

program
    .arguments('<tastee script file>')
    .option('-i, --instructions <instruction files>', 'Custom instruction files separated with semicolons')
    .option('-p, --parameters <parameter files>', 'Custom parameter files separated with semicolons')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)')
    .option('-s, --screenshotpath <screenshotpath>', 'Screenshotpath is path where screenshot is saved')
    .option('-r, --reporter <reporter>', 'Select the desired report between : junit')
    .action(function (file) {

        console.log('instructions: %s parameters: %s file: %s screenshotpath: %s reporter: %s',
            program.instructions, program.parameters, file, program.screenshotpath, program.reporter);

        if (program.instructions) {
            program.instructions.split(";").forEach(function (filePath) {
                core.addPluginFile(filePath);
            });
        }
        if (program.parameters) {
            program.parameters.split(";").forEach(function (filePath) {
                core.addParamFile(filePath);
            });
        }
        var browser = 'chrome';
        if (program.browser) {
            browser = program.browser;
        }
        var screenshotpath = './tastee-report/screenshot'
        if (program.screenshotpath) {
            screenshotpath = program.screenshotpath;
        }
        var reporter = './tastee-report/'
        if (program.reporter) {
            reporter = program.reporter;
        }

        fs.readFile(file, "utf8", function (err, data) {
            if (!err) {
                core.init(browser, screenshotpath);

                core.execute(data).then(function (instructions) {
                    switch (reporter) {
                        case "junit": Reporter.generateJunitReporter(instructions); break;
                        default: Reporter.generateConsoleLog(instructions);
                    }
                });;
                core.stop();
            } else {
                console.error(err);
            }
        });
    })
    .parse(process.argv);
