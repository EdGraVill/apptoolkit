#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith('-') ? args[0] : 'setup';

if (command !== 'setup') {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

const hasFlag = (flag) => args.includes(flag);
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
const dryRun = hasFlag('--dry-run');
const withStories = hasFlag('--stories');

const baseConfig = '../eslint-config/index.js';
const scriptsWithoutStories = {
  lint: `eslint --config ${baseConfig} src`,
  'lint:fast': `eslint --cache --cache-location .eslintcache --config ${baseConfig} src`,
  'lint:ci': `eslint --no-cache --config ${baseConfig} src`,
};

const scriptsWithStories = {
  lint: `eslint --config ${baseConfig} "src/**/*.{ts,tsx}" --ignore-pattern "**/*.stories.*" && eslint --config ${baseConfig} "src/**/*.stories.*" --rule "import/no-anonymous-default-export: off"`,
  'lint:fast': `eslint --cache --cache-location .eslintcache --config ${baseConfig} "src/**/*.{ts,tsx}" --ignore-pattern "**/*.stories.*" && eslint --cache --cache-location .eslintcache --config ${baseConfig} "src/**/*.stories.*" --rule "import/no-anonymous-default-export: off"`,
  'lint:ci': `eslint --no-cache --config ${baseConfig} "src/**/*.{ts,tsx}" --ignore-pattern "**/*.stories.*" && eslint --no-cache --config ${baseConfig} "src/**/*.stories.*" --rule "import/no-anonymous-default-export: off"`,
};

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(packageJsonPath, 'utf8');
const json = JSON.parse(raw);

json.scripts = json.scripts || {};
json.devDependencies = json.devDependencies || {};

const selectedScripts = withStories ? scriptsWithStories : scriptsWithoutStories;
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
