import decrypt from './decrypt';
import encrypt from './encrypt';
import generateKeypair from './generateKeypair';
import getKeyPair from './getKeyPair';
import { randomBytes } from 'crypto';

describe('generateKeypair', () => {
  it('Should fail if a passphrase is not provided', async () => {
    await expect(generateKeypair('')).rejects.toThrow();
  });

  it('Should generate KeyPair object', async () => {
    const keypair = await generateKeypair('secret');

    expect(keypair).toHaveProperty('privateKey');
    expect(keypair).toHaveProperty('publicKey');
  });
});

describe('getKeyPair', () => {
  const passphrase = 'secret';
  let keyString = '';

  beforeAll(async () => {
    const { privateKey } = await generateKeypair(passphrase);

    keyString = privateKey.export({ cipher: 'aes-256-cbc', format: 'pem', passphrase, type: 'pkcs8' }).toString();
  });

  beforeEach(() => {
    process.env.RSA_PRIVATE_KEY = keyString;
    process.env.RSA_KEY_PASSPHRASE = passphrase;
  });

  it('Should throw an error if privateKey is not provided', () => {
    delete process.env.RSA_PRIVATE_KEY;

    expect(() => getKeyPair()).toThrow();
  });

  it('Should throw an error if passphrase is incorrect', () => {
    const wrongPassphrase = 'terces';

    process.env.RSA_KEY_PASSPHRASE = wrongPassphrase;

    expect(() => getKeyPair()).toThrow();
  });

  it('Should generate KeyPair object', () => {
    const keypair = getKeyPair();

    expect(keypair).toHaveProperty('privateKey');
    expect(keypair).toHaveProperty('publicKey');
  });

  it('Should recycle the already generated KeyPair object', () => {
    const keypair = getKeyPair();
    const secondKeypair = getKeyPair();

    expect(keypair).toBe(secondKeypair);
  });
});

describe('encrypt / decrypt', () => {
  beforeAll(async () => {
    const passphrase = 'secret';
    const { privateKey } = await generateKeypair(passphrase);

    process.env.RSA_PRIVATE_KEY = privateKey
      .export({ cipher: 'aes-256-cbc', format: 'pem', passphrase, type: 'pkcs8' })
      .toString();
    process.env.RSA_KEY_PASSPHRASE = passphrase;
  });

  it('Should encrypt and decrypt information', () => {
    const information = 'Magna dolore ut enim deserunt et cupidatat deserunt et nulla.';

    const encrypted = encrypt(Buffer.from(information));
    const decrypted = decrypt(encrypted);

    expect(information).toBe(decrypted.toString('utf8'));
  });

  it('Should encrypt and decrypt long information', () => {
    const longInformation = Array.from({ length: 100_000 })
      .map(() => 'Ut sunt duis magna laborum occaecat cupidatat laboris Lorem velit.')
      .join('');

    const encrypted = encrypt(Buffer.from(longInformation));
    const decrypted = decrypt(encrypted);

    expect(decrypted.toString('utf-8')).toBe(longInformation);
  });
});
