/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KeyObject } from 'crypto';
import { createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt } from 'crypto';

export interface KeyPair {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

const keypair: KeyPair | Record<keyof KeyPair, undefined | KeyObject> = ((global as any)[Symbol('keypair')] = {
  privateKey: undefined,
  publicKey: undefined,
});

export function getKeyPair(): KeyPair {
  if (keypair.privateKey && keypair.publicKey) {
    return keypair as KeyPair;
  }

  const stringPrivateKey = process.env.PRIVATE_KEY;
  const passphrase = process.env.PASSPHRASE;

  if (!stringPrivateKey) {
    throw new Error(''); // TODO
  }

  const bufferPrivateKey = Buffer.from(stringPrivateKey);

  const privateKey = createPrivateKey({ key: bufferPrivateKey, passphrase: passphrase });
  const publicKey = createPublicKey({ key: Buffer.from(privateKey.export()) });

  keypair.privateKey = privateKey;
  keypair.publicKey = publicKey;

  return keypair as KeyPair;
}

export function encrypt(data: Buffer): Buffer {
  const { publicKey } = getKeyPair();

  return publicEncrypt(publicKey, data);
}

export function decryot(data: Buffer): Buffer {
  const { privateKey } = getKeyPair();

  return privateDecrypt(privateKey, data);
}
