import type { KeyPair } from './getKeyPair';
import { generateKeyPair, createPrivateKey, createPublicKey } from 'crypto';
import { promisify } from 'util';

export default async function generateKeypair(passphrase: string): Promise<KeyPair> {
  if (!passphrase) {
    throw new Error('Passphrase required'); // TODO
  }

  const { privateKey: stringKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength: 4096,
    privateKeyEncoding: {
      cipher: 'aes-256-cbc',
      format: 'pem',
      passphrase,
      type: 'pkcs8',
    },
    publicKeyEncoding: {
      format: 'pem',
      type: 'spki',
    },
  });

  const privateKey = createPrivateKey({ key: Buffer.from(stringKey), passphrase: passphrase });
  const publicKey = createPublicKey({ key: Buffer.from(privateKey.export({ format: 'pem', type: 'pkcs8' })) });

  return {
    privateKey,
    publicKey,
  };
}
