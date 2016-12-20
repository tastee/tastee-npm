/// <reference path="../node_modules/@types/node/index.d.ts" />
"use strict";
var fs = require("fs");
var tastee_core_1 = require("tastee-core/src/app/tastee-core");
var tastee_engine_1 = require("tastee-core/src/app/tastee-engine");
var tastee_analyser_1 = require("tastee-core/src/app/tastee-analyser");
var path = require("path");
var glob = require("glob");
var TasteeProgram = (function () {
    function TasteeProgram(program) {
        this.workingConfigurationFilesCb = function (file, tasteeProgram) { return function (err, filenames) {
            filenames.forEach(function (filename) {
                if (filename.search('/\.conf\.tee/')) {
                    console.log('Add plugin file :' + filename);
                    tasteeProgram.core.addPluginFile(filename);
                }
                else {
                    console.log('Add param file :' + filename);
                    tasteeProgram.core.addParamFile(filename);
                }
            });
        }; };
        this.readFilesCb = function (filename, tasteeProgram) { return function (err, data) {
            console.log('Starting  :' + filename);
            if (!err) {
                console.log(tasteeProgram);
                tasteeProgram.core.initEnginer(new tastee_engine_1.TasteeEngine(tasteeProgram.program.browser, tasteeProgram.program.path));
                tasteeProgram.executeTasteeCore(data, filename, tasteeProgram);
                tasteeProgram.core.stop();
            }
            else {
                console.error(err);
            }
        }; };
        this.workingTasteeFilesCb = function (file, tasteeProgram) { return function (err, filenames) {
            filenames.forEach(function (filename) {
                fs.readFile(filename, "utf8", tasteeProgram.readFilesCb(filename, tasteeProgram));
            });
        }; };
        this.program = program;
        this.core = new tastee_core_1.TasteeCore(new tastee_engine_1.TasteeEngine(program.browser, program.path), new tastee_analyser_1.TasteeAnalyser());
    }
    TasteeProgram.prototype.runDebugMode = function (file) {
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
                this.executeTasteeCore(data, file, tasteeProgram);
                tasteeProgram.core.stop();
            }
            else {
                console.error(err);
            }
        });
    };
    TasteeProgram.prototype.executeTasteeCore = function (data, filename, tasteeProgram) {
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
    };
    TasteeProgram.prototype.runContinuusMode = function (file) {
        console.log('Started ...');
        var tasteeProgram = this;
        glob(path.join(file, "**", "+(*.conf|*.param).tee"), { absolute: true }, this.workingConfigurationFilesCb(file, tasteeProgram));
        glob(path.join(file, "**", "!(*.conf|*.param).tee"), { absolute: true }, this.workingTasteeFilesCb(file, tasteeProgram));
    };
    TasteeProgram.prototype.run = function (file) {
    };
    return TasteeProgram;
}());
exports.TasteeProgram = TasteeProgram;
//# sourceMappingURL=/Users/luya/Workspace/tastee/tastee-npm/tastee-program.js.map