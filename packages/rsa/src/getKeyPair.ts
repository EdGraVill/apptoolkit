/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KeyObject } from 'crypto';
import { createPrivateKey, createPublicKey } from 'crypto';

export interface KeyPair {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

const keypair: KeyPair | Record<keyof KeyPair, undefined | KeyObject> = ((globalThis as any)[Symbol('keypair')] = {
  privateKey: undefined,
  publicKey: undefined,
});

export default function getKeyPair() {
  if (keypair.privateKey && keypair.publicKey) {
    return keypair as KeyPair;
  }

  const stringPrivateKey = process.env.RSA_PRIVATE_KEY;
  const passphrase = process.env.RSA_KEY_PASSPHRASE;

  if (!stringPrivateKey) {
    throw new Error(''); // TODO
  }

  const bufferPrivateKey = Buffer.from(stringPrivateKey);

  try {
    const privateKey = createPrivateKey({ key: bufferPrivateKey, passphrase: passphrase });
    const publicKey = createPublicKey({ key: Buffer.from(privateKey.export({ format: 'pem', type: 'pkcs8' })) });

    keypair.privateKey = privateKey;
    keypair.publicKey = publicKey;

    return keypair as KeyPair;
  } catch (error) {
    throw new Error(''); // TODO
  }
}
