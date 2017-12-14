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
        private core: TasteeCore;

        constructor(program) {
                this.program = program;
                this.core = new TasteeCore(new TasteeAnalyser());
        }

        public runTasteeFile(file: string) {
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
                                this.core.addPluginFile(path)
                        } else {
                                const pathOfFile = path.join(path.dirname(file), match[1]);
                                if (fs.existsSync(pathOfFile)) {
                                        this.core.addPluginFile(pathOfFile)
                                }
                        }
                }
                this.core.init(new TasteeEngine(this.program.browser))
                this.core.execute(data.join('\n'), file).then(instructions => {
                        this.core.stop();
                        this.writeReportingFromHtml(file, instructions);
                });
        }

        public writeReportingFromHtml(file: string, instructions: Array<any>) {
                const html = fs.readFileSync(path.join(__dirname, "../reporting", "template.html"), "utf8");
                const dataFile = cheerio.load(fs.readFileSync(file).toString());

                dataFile('pre.tastee').each((idx, elt) => {
                        let instruction = instructions.filter(instruction => instruction.lineNumber == idx)[0];
                        if (instruction.valid) {
                                elt.attribs = { class: 'tastee green' }
                        } else {
                                elt.attribs = { class: 'tastee red' }
                        }
                });
                var output = mustache.to_html(html, { nameOfTest: path.basename(file, '.tee'), data: dataFile.html() });
                if (!fs.existsSync(this.program.output)) {
                        fs.mkdirSync(this.program.output);
                }    
                fs.writeFileSync(path.join(this.program.output, path.basename(file, '.tee') + '.html'), output);
                fs.createReadStream(path.join(__dirname, "../reporting", "home.png")).pipe(fs.createWriteStream(path.join(this.program.output, 'home.png')));
        }

        public runAllTasteeFiles(file: string) {
                console.log('Started ...')
                var tasteeProgram: TasteeProgram = this;
                let files = glob.sync(path.join(file, "**", "!(*.conf|*.param).tee"), { absolute: true });
                files.foreach(file => this.runTasteeFile(file))
        }
}
