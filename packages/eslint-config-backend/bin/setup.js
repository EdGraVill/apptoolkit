#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith('-') ? args[0] : 'setup';

if (command !== 'setup') {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

const getOption = (name) => {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
};

const targetDirOption = getOption('--package');
const targetDir = path.resolve(process.cwd(), targetDirOption || '.');
const packageJsonPath = path.join(targetDir, 'package.json');
const dryRun = args.includes('--dry-run');

const baseConfig = '../eslint-config-backend/index.js';
const selectedScripts = {
  lint: `eslint --config ${baseConfig} src`,
  'lint:fast': `eslint --cache --cache-location .eslintcache --config ${baseConfig} src`,
  'lint:ci': `eslint --no-cache --config ${baseConfig} src`,
};

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(packageJsonPath, 'utf8');
const json = JSON.parse(raw);

json.scripts = json.scripts || {};
json.devDependencies = json.devDependencies || {};
json.scripts = {
  ...json.scripts,
  ...selectedScripts,
};

if (!json.devDependencies.eslint) {
  json.devDependencies.eslint = '>= 10';
}

const output = `${JSON.stringify(json, null, 2)}\n`;

if (dryRun) {
  process.stdout.write(output);
  process.exit(0);
}

fs.writeFileSync(packageJsonPath, output, 'utf8');
process.stdout.write(`Updated ${packageJsonPath}\n`);
