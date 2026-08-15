/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KeyObject } from 'crypto';
import { createPrivateKey, createPublicKey } from 'crypto';
import { readFile } from 'fs/promises';

export interface KeyPair {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

const keypair: KeyPair | Record<keyof KeyPair, undefined | KeyObject> = ((globalThis as any)[Symbol('keypair')] = {
  privateKey: undefined,
  publicKey: undefined,
});

async function getKeyPair() {
  if (keypair.privateKey && keypair.publicKey) {
    return keypair as KeyPair;
  }

  let stringPrivateKey = process.env.RSA_PRIVATE_KEY;
  const passphrase = process.env.RSA_KEY_PASSPHRASE;

  if (stringPrivateKey?.includes('.pem') && !stringPrivateKey.includes('KEY-----')) {
    try {
      stringPrivateKey = await readFile(stringPrivateKey, { encoding: 'utf-8' });
    } catch {}
  }

  if (!stringPrivateKey) {
    throw new Error(''); // TODO
  }

  try {
    const privateKey = createPrivateKey({ key: stringPrivateKey, passphrase: passphrase });
    const exportedPrivateKey = privateKey.export({ format: 'pem', type: 'pkcs8' }) as unknown;
    const privateKeyPem: string = typeof exportedPrivateKey === 'string' ? exportedPrivateKey : String(exportedPrivateKey);
    const publicKey = createPublicKey(privateKeyPem as any);

    keypair.privateKey = privateKey;
    keypair.publicKey = publicKey;

    return keypair as KeyPair;
  } catch (error) {
    const wrappedError = new Error('Failed to derive RSA key pair from RSA_PRIVATE_KEY');
    (wrappedError as Error & { cause?: unknown }).cause = error;
    throw wrappedError;
  }
}

export default Object.assign(getKeyPair, {
  cleanCache() {
    keypair.privateKey = undefined;
    keypair.publicKey = undefined;
  },
});
