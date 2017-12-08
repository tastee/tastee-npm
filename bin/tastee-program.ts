/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as fs from 'fs';
import { TasteeCore } from 'tastee-core/transpiled/src/app/tastee-core';
import { TasteeReporter } from 'tastee-core/transpiled/src/app/tastee-reporter';
import { TasteeEngine } from 'tastee-core/transpiled/src/app/tastee-engine';
import { TasteeAnalyser } from 'tastee-core/transpiled/src/app/tastee-analyser';
import * as path from 'path';
import * as glob from 'glob';

export class TasteeProgram {
        private program: any;
        private core: TasteeCore;

        constructor(program) {
                this.program = program;
                this.core = new TasteeCore(new TasteeAnalyser());
        }

        public runDebugMode(file: string) {
                var tasteeProgram: TasteeProgram = this;
                if (tasteeProgram.program.instructions) {
                        tasteeProgram.program.instructions.split(";").forEach(function (filePath) {
                                tasteeProgram.core.addPluginFile(filePath);
                        });
                        console.log('instructions  : ' + tasteeProgram.program.instructions);
                }

                if (tasteeProgram.program.conf) {
                        tasteeProgram.program.conf.split(";").forEach(function (filePath) {
                                tasteeProgram.core.addParamFile(filePath);
                        });
                        console.log('conf : ' + tasteeProgram.program.parameters);
                }
                fs.readFile(file, "utf8", function (err, data) {
                        console.log('Started ...')
                        if (!err) {
                                tasteeProgram.core.init(new TasteeEngine(tasteeProgram.program.browser, tasteeProgram.program.path))
                                tasteeProgram.executeTasteeCore(data, file, tasteeProgram);
                        } else {
                                console.error(err);
                        }
                });
        }

        private executeTasteeCore(data: string, filename: string, tasteeProgram: TasteeProgram) {
                tasteeProgram.core.execute(data, path.basename(filename, ".tee")).then(function (instructions) {
                        console.log('Finished :' + filename);
                        tasteeProgram.core.stop();
                });;
        }

        public workingConfigurationFilesCb = (file: string, tasteeCore: TasteeCore) => function (err, filenames) {
                filenames.forEach(function (filename) {
                        if (filename.indexOf('.yaml') !== -1) {
                                console.log('Add plugin file :' +filename)
                                tasteeCore.addPluginFile(filename);
                        } else {
                                console.log('Add param file :' + filename)
                                tasteeCore.addParamFile(filename);
                        }
                });
        }

        public readFilesCb = (filename, tasteeProgram: TasteeProgram) => function (err, data) {
                console.log('Starting  :' + filename);
                if (!err) {
                        tasteeProgram.core.init(new TasteeEngine(tasteeProgram.program.browser, tasteeProgram.program.path));
                        tasteeProgram.executeTasteeCore(data, filename, tasteeProgram);
                } else {
                        console.error(err);
                }
        }

        public workingTasteeFilesCb = (file: string, tasteeProgram: TasteeProgram) => function (err, filenames) {
                filenames.forEach(function (filename) {
                        fs.readFile(filename, "utf8", tasteeProgram.readFilesCb(filename, tasteeProgram));
                });
        }

        public runContinuusMode(file: string) {
                console.log('Started ...')
                var tasteeProgram: TasteeProgram = this;
                glob(path.join(file, "**", "+(*.conf|*.param).tee"), { absolute: true }, this.workingConfigurationFilesCb(file, this.core));
                glob(path.join(file, "**", "!(*.conf|*.param).tee"), { absolute: true }, this.workingTasteeFilesCb(file, tasteeProgram));
        }

        public run(file: string) {

        }

}
