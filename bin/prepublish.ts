import { writeFileSync, copyFileSync } from 'fs';
import { EOL } from 'os';
import originPackage from '../package.json';

const distPackage: Record<string, unknown> = originPackage;
distPackage.module = './index.js';
distPackage.main = './index.js';
distPackage.typings = './index.d.ts';
distPackage.sideEffects = false;
delete distPackage.scripts;
delete distPackage.devDependencies;
delete distPackage.config;
delete distPackage.husky;
delete distPackage.files;
delete distPackage.directories;
delete distPackage['lint-staged'];

writeFileSync('./dist/package.json', JSON.stringify(distPackage, null, 4) + EOL);

const copyFiles = ['README.md'];
for (const file of copyFiles) {
    copyFileSync(`./${file}`, `./dist/${file}`);
}
