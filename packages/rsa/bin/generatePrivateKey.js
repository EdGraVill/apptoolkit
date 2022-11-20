#! /usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const { default: generateKeypair } = require('../dist/generateKeypair');
const { createInterface } = require('readline');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { passphrase: argPassphrase } = yargs(hideBin(process.argv))
  .option('passphrase', {
    alias: 'p',
    description: 'Passphrase for the key',
    string: true,
    type: 'string',
  })
  .help()
  .alias('h', 'help')
  .hide('version')
  .parse();

async function main() {
  return new Promise(async (resolve) => {
    const readLine = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (argPassphrase) {
      const { privateKey } = await generateKeypair(argPassphrase);

      const stringKey = privateKey.export({
        cipher: 'aes-256-cbc',
        format: 'pem',
        passphrase: argPassphrase,
        type: 'pkcs8',
      });

      return resolve(stringKey);
    }

    readLine.question('Type a Passphrase for your key: ', async (passphrase) => {
      const { privateKey } = await generateKeypair(passphrase);

      const stringKey = privateKey.export({ cipher: 'aes-256-cbc', format: 'pem', passphrase, type: 'pkcs8' });

      resolve(stringKey);
    });
  });
}

main().then((key) => {
  process.stdout.write(key);
  process.exit();
});
