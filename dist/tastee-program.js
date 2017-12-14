"use strict";
/// <reference path="../node_modules/@types/node/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const tastee_core_1 = require("tastee-core");
const tastee_html_1 = require("tastee-html");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const mustache = require("mustache");
const cheerio = require("cheerio");
class TasteeProgram {
    constructor(program) {
        this.program = program;
        this.core = new tastee_core_1.TasteeCore(new tastee_core_1.TasteeAnalyser());
    }
    runTasteeFile(file) {
        let data = [];
        switch (this.program.extract) {
            case 'html':
                data = tastee_html_1.ExtractTasteeCode.extract(file);
        }
        const regex = /\/\/savor\ (.*.yaml)/g;
        let match;
        let pluginTreated = false;
        while (match = regex.exec(data.join('\n'))) {
            if (path.isAbsolute(match[1])) {
                this.core.addPluginFile(path);
            }
            else {
                const pathOfFile = path.join(path.dirname(file), match[1]);
                if (fs.existsSync(pathOfFile)) {
                    this.core.addPluginFile(pathOfFile);
                }
            }
        }
        this.core.init(new tastee_core_1.TasteeEngine(this.program.browser));
        this.core.execute(data.join('\n'), file).then(instructions => {
            this.core.stop();
            this.writeReportingFromHtml(file, instructions);
        });
    }
    writeReportingFromHtml(file, instructions) {
        const html = fs.readFileSync(path.join(__dirname, "../reporting", "template.html"), "utf8");
        const dataFile = cheerio.load(fs.readFileSync(file).toString());
        dataFile('pre.tastee').each((idx, elt) => {
            let instruction = instructions.filter(instruction => instruction.lineNumber == idx)[0];
            if (instruction.valid) {
                elt.attribs = { class: 'tastee green' };
            }
            else {
                elt.attribs = { class: 'tastee red' };
            }
        });
        var output = mustache.to_html(html, { nameOfTest: path.basename(file, '.tee'), data: dataFile.html() });
        if (!fs.existsSync(this.program.output)) {
            fs.mkdirSync(this.program.output);
        }
        fs.writeFileSync(path.join(this.program.output, path.basename(file, '.tee') + '.html'), output);
        fs.createReadStream(path.join(__dirname, "../reporting", "home.png")).pipe(fs.createWriteStream(path.join(this.program.output, 'home.png')));
    }
    runAllTasteeFiles(file) {
        console.log('Started ...');
        var tasteeProgram = this;
        let files = glob.sync(path.join(file, "**", "!(*.conf|*.param).tee"), { absolute: true });
        files.foreach(file => this.runTasteeFile(file));
    }
}
exports.TasteeProgram = TasteeProgram;
