import getKeyPair from './getKeyPair';
import { publicEncrypt } from 'crypto';

export default function encrypt(data: Buffer) {
  const { publicKey } = getKeyPair();

  return publicEncrypt(publicKey, data);
}
