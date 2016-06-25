#!/usr/bin/env node

var program = require('commander');
var fs = require("fs");
var core = require("tasty-core");

program
    .arguments('<tasty script file>')
    .option('-i, --instructions <instruction files>', 'Custom instruction files separated with semicolons')
    .option('-p, --parameters <parameter files>', 'Custom parameter files separated with semicolons')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)')
    .action(function (file) {

        console.log('instructions: %s parameters: %s file: %s',
            program.instructions, program.parameters, file);

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

        fs.readFile(file, "utf8", function (err, data) {
            if (!err) {
                core.init(browser);

                core.execute(data).then(function (instructions) {
                    for (var i = 0; i < instructions.length; i++) {
                        console.log(instructions[i].toString())
                    }
                });;
                core.stop();
            } else {
                console.error(err);
            }
        });
    })
    .parse(process.argv);
