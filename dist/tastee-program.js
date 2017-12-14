"use strict";
/// <reference path="../node_modules/@types/node/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const tastee_core_1 = require("tastee-core");
const tastee_html_1 = require("tastee-html");
const fs = require("fs");
const util = require("util");
const path = require("path");
const glob = require("glob");
const mustache = require("mustache");
const cheerio = require("cheerio");
class TasteeProgram {
    constructor(program) {
        this.files = [];
        this.program = program;
    }
    runProgram(file) {
        if (fs.lstatSync(file).isFile()) {
            this.runTasteeFile(file);
        }
        else {
            let files = glob.sync(path.join(file, "**", "*.tee"), { absolute: true });
            files.forEach(file => this.runTasteeFile(file));
        }
    }
    runTasteeFile(file) {
        const core = new tastee_core_1.TasteeCore(new tastee_core_1.TasteeAnalyser());
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
                core.addPluginFile(path);
            }
            else {
                const pathOfFile = path.join(path.dirname(file), match[1]);
                if (fs.existsSync(pathOfFile)) {
                    core.addPluginFile(pathOfFile);
                }
            }
        }
        core.init(new tastee_core_1.TasteeEngine(this.program.browser));
        core.execute(data.join('\n'), file).then(instructions => {
            core.stop();
            this.writeReportingFromHtml(file, instructions);
            this.writeIndexFile();
        });
    }
    writeReportingFromHtml(file, instructions) {
        const html = fs.readFileSync(path.join(__dirname, "../reporting", "template_tastee_file.html"), "utf8");
        const dataFile = cheerio.load(fs.readFileSync(file).toString());
        const nameOfFile = path.basename(file, '.tee');
        dataFile('pre.tastee').each((idx, elt) => {
            let instruction = instructions.filter(instruction => instruction.lineNumber == idx)[0];
            if (instruction.valid) {
                elt.attribs = { class: 'tastee green' };
            }
            else {
                elt.attribs = { class: 'tastee red' };
            }
        });
        var output = mustache.to_html(html, { nameOfTest: nameOfFile, data: dataFile.html() });
        if (!fs.existsSync(this.program.output)) {
            fs.mkdirSync(this.program.output);
        }
        fs.writeFileSync(path.join(this.program.output, util.format('%s.html', nameOfFile)), output);
        const hasErrors = instructions.filter(instruction => !instruction.valid).length > 0;
        this.files.push({ link: util.format('<a class="%s" href="./%s.html">%s</a>', hasErrors ? 'ko' : 'ok', nameOfFile, nameOfFile) });
        fs.createReadStream(path.join(__dirname, "../reporting", "home.png")).pipe(fs.createWriteStream(path.join(this.program.output, 'home.png')));
    }
    writeIndexFile() {
        const html = fs.readFileSync(path.join(__dirname, "../reporting", "template_index.html"), "utf8");
        var output = mustache.to_html(html, { files: this.files });
        fs.writeFileSync(path.join(this.program.output, 'index.html'), output);
    }
}
exports.TasteeProgram = TasteeProgram;
