import getKeyPair from './getKeyPair';
import { privateDecrypt } from 'crypto';

export default function decrypt(data: Buffer) {
  const { privateKey } = getKeyPair();

  return privateDecrypt(privateKey, data);
}
