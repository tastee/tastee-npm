#!/usr/bin/env node
"use strict";
var program = require("commander");
var tastee_program_1 = require("./tastee-program");
var fs = require("fs");
program
    .arguments('<tastee script file>')
    .option('-i, --instructions <instruction files>', 'Custom instruction files separated with semicolons')
    .option('-c, --conf <parameter files>', 'Custom parameter files separated with semicolons')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)', 'firefox')
    .option('-p, --path <path>', 'Path is path where rapport generated', './tastee-reporting')
    .option('-r, --reporter <reporter>', 'Select the desired report between : junit', 'html')
    .action(function (file) {
    console.log('   ***   ');
    console.log('browser       : ' + program.browser);
    console.log('reporting path : ' + program.path);
    console.log('   ***   ');
    var tasteeProgram = new tastee_program_1.TasteeProgram(program);
    if (fs.lstatSync(file).isFile()) {
        tasteeProgram.runDebugMode(file);
    }
    else {
        tasteeProgram.runContinuusMode(file);
    }
})
    .parse(process.argv);
//# sourceMappingURL=/Users/luya/Workspace/tastee/tastee-npm/tastee.js.map