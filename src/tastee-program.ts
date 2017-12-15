/// <reference path="../node_modules/@types/node/index.d.ts" />

import { TasteeAnalyser, TasteeCore, TasteeEngine, TasteeReporter } from 'tastee-core';
import { ExtractTasteeCode } from 'tastee-html';

import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as glob from 'glob';
import * as mustache from 'mustache';
import * as cheerio from 'cheerio';

export class TasteeProgram {
        private program: any;
        private files: Array<any> = [];
        constructor(program) {
                this.program = program;
        }


        public runProgram(file: string) {
                if (fs.lstatSync(file).isFile()) {
                        this.runTasteeFile(file);
                } else {
                        let files = glob.sync(path.join(file, "**", "*.html"), { absolute: true });
                        files.forEach(file => this.runTasteeFile(file))
                }
        }

        public runTasteeFile(file: string) {
                const core = new TasteeCore(new TasteeAnalyser());
                let data: Array<String> = [];
                switch (this.program.extract) {
                        case 'html':
                                data = ExtractTasteeCode.extract(file);

                }
                const regex = /\/\/savor\ (.*.yaml)/g;
                let match;
                let pluginTreated = false;
                while (match = regex.exec(data.join('\n'))) {
                        if (path.isAbsolute(match[1])) {
                                core.addPluginFile(path)
                        } else {
                                const pathOfFile = path.join(path.dirname(file), match[1]);
                                if (fs.existsSync(pathOfFile)) {
                                        core.addPluginFile(pathOfFile)
                                }
                        }
                }
                core.init(new TasteeEngine(this.program.browser))
                core.execute(data.join('\n'), file).then(instructions => {
                        core.stop();
                        this.writeReportingFromHtml(file, instructions);
                        this.writeIndexFile();
                });
        }

        public writeReportingFromHtml(file: string, instructions: Array<any>) {
                const html = fs.readFileSync(path.join(__dirname, "../reporting", "template_tastee_file.html"), "utf8");
                const dataFile = cheerio.load(fs.readFileSync(file).toString());
                const nameOfFile = path.basename(file, '.html');
                dataFile('pre.tastee').each((idx, elt) => {
                        let instruction = instructions.filter(instruction => instruction.lineNumber == idx)[0];
                        if (instruction.valid) {
                                elt.attribs = { class: 'tastee green' }
                        } else {
                                elt.attribs = { class: 'tastee red' }
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

        public writeIndexFile() {
                const html = fs.readFileSync(path.join(__dirname, "../reporting", "template_index.html"), "utf8");
                var output = mustache.to_html(html, { files: this.files });
                fs.writeFileSync(path.join(this.program.output, 'index.html'), output);
        }

}
