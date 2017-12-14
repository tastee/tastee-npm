#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const tastee_program_1 = require("./tastee-program");
const fs = require("fs");
program
    .arguments('<tastee script file>')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)', 'firefox')
    .option('-o, --output <output>', 'Path is path where rapport generated', './tastee-reporting')
    .option('-r, --extract <extract>', 'Extract Tastee code from html file or other.', 'html')
    .action(function (file) {
    console.log('   ***   ');
    console.log('browser       : ' + program.browser);
    console.log('output path   : ' + program.output);
    console.log('extract       : ' + program.extract);
    console.log('   ***   ');
    let tasteeProgram = new tastee_program_1.TasteeProgram(program);
    if (fs.lstatSync(file).isFile()) {
        tasteeProgram.runTasteeFile(file);
    }
    else {
        tasteeProgram.runAllTasteeFiles(file);
    }
})
    .parse(process.argv);
