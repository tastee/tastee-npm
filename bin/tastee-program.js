"use strict";
/// <reference path="../node_modules/@types/node/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const tastee_core_1 = require("tastee-core/transpiled/src/app/tastee-core");
const tastee_engine_1 = require("tastee-core/transpiled/src/app/tastee-engine");
const tastee_analyser_1 = require("tastee-core/transpiled/src/app/tastee-analyser");
const path = require("path");
const glob = require("glob");
class TasteeProgram {
    constructor(program) {
        this.workingConfigurationFilesCb = (file, tasteeCore) => function (err, filenames) {
            filenames.forEach(function (filename) {
                if (filename.indexOf('.conf.tee') !== -1) {
                    console.log('Add plugin file :' + filename);
                    tasteeCore.addPluginFile(filename);
                }
                else {
                    console.log('Add param file :' + filename);
                    tasteeCore.addParamFile(filename);
                }
            });
        };
        this.readFilesCb = (filename, tasteeProgram) => function (err, data) {
            console.log('Starting  :' + filename);
            if (!err) {
                tasteeProgram.core.init(new tastee_engine_1.TasteeEngine(tasteeProgram.program.browser, tasteeProgram.program.path));
                tasteeProgram.executeTasteeCore(data, filename, tasteeProgram);
                //tasteeProgram.core.stop();
            }
            else {
                console.error(err);
            }
        };
        this.workingTasteeFilesCb = (file, tasteeProgram) => function (err, filenames) {
            filenames.forEach(function (filename) {
                fs.readFile(filename, "utf8", tasteeProgram.readFilesCb(filename, tasteeProgram));
            });
        };
        this.program = program;
        this.core = new tastee_core_1.TasteeCore(new tastee_analyser_1.TasteeAnalyser());
    }
    runDebugMode(file) {
        var tasteeProgram = this;
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
            console.log('Started ...');
            if (!err) {
                tasteeProgram.core.init(new tastee_engine_1.TasteeEngine(tasteeProgram.program.browser, tasteeProgram.program.path));
                tasteeProgram.executeTasteeCore(data, file, tasteeProgram);
                //tasteeProgram.core.stop();
            }
            else {
                console.error(err);
            }
        });
    }
    executeTasteeCore(data, filename, tasteeProgram) {
        tasteeProgram.core.execute(data, path.basename(filename, ".tee")).then(function (instructions) {
            switch (tasteeProgram.program.reporter) {
                case "junit":
                    tasteeProgram.core.engine.reporter.generateJunitReporter(instructions);
                    break;
                case "html":
                    tasteeProgram.core.engine.reporter.generateHtmlReporter(tasteeProgram.program.path, path.basename(filename, ".tee"), instructions);
                    break;
            }
            console.log('Finished :' + filename);
        });
        ;
    }
    runContinuusMode(file) {
        console.log('Started ...');
        var tasteeProgram = this;
        glob(path.join(file, "**", "+(*.conf|*.param).tee"), { absolute: true }, this.workingConfigurationFilesCb(file, this.core));
        glob(path.join(file, "**", "!(*.conf|*.param).tee"), { absolute: true }, this.workingTasteeFilesCb(file, tasteeProgram));
    }
    run(file) {
    }
}
exports.TasteeProgram = TasteeProgram;
//# sourceMappingURL=/Users/luya/Workspace/tastee-npm/tastee-program.js.map