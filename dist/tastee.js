#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const tastee_program_1 = require("./tastee-program");
program
    .arguments('<tastee script file>')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)', 'firefox')
    .option('-o, --output <output>', 'Path is path where rapport generated', './tastee-reporting')
    .option('-r, --extract <extract>', 'Extract Tastee code from html file or other.', 'html')
    .option('-e, --headless <headless>', 'Enable headless mode for chrome and firefox.', 'false')
    .option('-l, --loglevel <loglevel>', 'set log level (error|warn|info|verbose|debug|silly) default error, use debug to see executed instructions.', 'error')
    .action(function (file) {
    console.log('   ***   ');
    console.log('browser       : ' + program.browser);
    console.log('output path   : ' + program.output);
    console.log('extract       : ' + program.extract);
    console.log('headless       : ' + program.headless);
    console.log('loglevel       : ' + program.loglevel);
    console.log('   ***   ');
    let tasteeProgram = new tastee_program_1.TasteeProgram(program);
    tasteeProgram.runProgram(file);
})
    .parse(process.argv);
