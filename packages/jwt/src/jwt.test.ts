import { generateKeypair, getKeyPair } from '@apptoolkit/rsa';

import { decodeJwt } from 'jose';

import type { JWTPayload } from './jwt';
import { signJWT, verifyJWT } from './jwt';

describe('signJWT / verifyJWT', () => {
  const passphrase = 'secret';
  let keyString = '';
  const payload: JWTPayload = {
    auth: false,
    email: 'mail@example.com',
    is2FAEnabled: true,
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeAll(async () => {
    const { privateKey } = await generateKeypair(passphrase);

    keyString = privateKey.export({ cipher: 'aes-256-cbc', format: 'pem', passphrase, type: 'pkcs8' }).toString();
  });

  beforeEach(() => {
    process.env.RSA_PRIVATE_KEY = keyString;
    process.env.RSA_KEY_PASSPHRASE = passphrase;
  });

  it('Should throw an error if the private key is not defined', async () => {
    delete process.env.RSA_PRIVATE_KEY;

    await expect(signJWT(payload)).rejects.toThrow();
  });

  it('Should throw an error if the passphrase is wrong', async () => {
    delete process.env.RSA_KEY_PASSPHRASE;

    await expect(signJWT(payload)).rejects.toThrow();
  });

  it('Should generate a jwt string', async () => {
    const jwt = await signJWT(payload);

    expect(typeof jwt).toBe('string');
  });

  it('Should include the Issuer if the APP_NAME env is set', async () => {
    process.env.APP_NAME = 'Test';
    const jwt = await signJWT(payload);

    const claim = decodeJwt(jwt);

    expect(claim).toHaveProperty('iss', process.env.APP_NAME);
  });

  it('Should throw an error if the the public key is not valid', async () => {
    const otherPassphrase = 'terces';
    const jwt = await signJWT(payload);

    getKeyPair.cleanCache();
    delete process.env.RSA_PRIVATE_KEY;
    const { privateKey } = await generateKeypair(otherPassphrase);
    process.env.RSA_PRIVATE_KEY = privateKey
      .export({ cipher: 'aes-256-cbc', format: 'pem', passphrase: otherPassphrase, type: 'pkcs8' })
      .toString();

    await expect(verifyJWT(jwt)).rejects.toThrow();
  });

  it('Should throw an error if the expiration date is reached', async () => {
    const jwt = await signJWT(payload);

    jest.useFakeTimers().setSystemTime(new Date().getTime() + 91 * 24 * 60 * 60 * 1000);

    await expect(verifyJWT(jwt)).rejects.toThrowError();
  });

  it('Should return the payload', async () => {
    const jwt = await signJWT(payload);

    const claim = await verifyJWT(jwt);

    Object.keys(payload).forEach((key) => {
      expect(claim).toHaveProperty(key, payload[key]);
    });
  });

  it('Should return the payload if issuer is not provided in both ends', async () => {
    delete process.env.APP_NAME;
    const jwt = await signJWT(payload);

    const claim = await verifyJWT(jwt);

    Object.keys(payload).forEach((key) => {
      expect(claim).toHaveProperty(key, payload[key]);
    });
  });
});
