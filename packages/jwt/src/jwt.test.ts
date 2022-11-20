import type { JWTPayload } from './jwt';
import { signJWT } from './jwt';
import { generateKeypair } from '@apptoolkit/rsa';

describe('signJWT / verifyJWT', () => {
  const passphrase = 'secret';
  let keyString = '';
  const payload: JWTPayload = {
    auth: false,
    email: 'mail@example.com',
    is2FAEnabled: true,
  };

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
});
