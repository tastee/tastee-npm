#!/usr/bin/env node

import * as program from 'commander';
import { TasteeProgram } from './tastee-program';
import * as fs from 'fs';

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
        let tasteeProgram: TasteeProgram = new TasteeProgram(program);
        if (fs.lstatSync(file).isFile()) {
            tasteeProgram.runDebugMode(file);
        } else {
            tasteeProgram.runContinuusMode(file);
        }
    })
    .parse(process.argv);