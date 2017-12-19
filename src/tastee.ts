#!/usr/bin/env node

import * as program from 'commander';
import { TasteeProgram } from './tastee-program';
import * as fs from 'fs';

program
    .arguments('<tastee script file>')
    .option('-b, --browser <browser>', 'Browser in which to execute script (either firefox, chrome, phantomJs, ... depending on your drivers)', 'firefox')
    .option('-o, --output <output>', 'Path is path where rapport generated', './tastee-reporting')
    .option('-r, --extract <extract>', 'Extract Tastee code from html file or other.', 'html')
    .option('-h, --headless <headless>', 'Enable headless mode for chrome and firefox.', false)
    .action(function (file) {
        console.log('   ***   ');
        console.log('browser       : ' + program.browser);
        console.log('output path   : ' + program.output);
        console.log('extract       : ' + program.extract);
        console.log('headless       : ' + program.headless);
        console.log('   ***   ');
        let tasteeProgram: TasteeProgram = new TasteeProgram(program);
        tasteeProgram.runProgram(file);        
    })
    .parse(process.argv);