/* eslint-disable @typescript-eslint/no-non-null-assertion */
import getKeyPair from './getKeyPair';
import { privateDecrypt } from 'crypto';

export default async function decrypt(data: Buffer) {
  const { privateKey } = await getKeyPair();
  const chunkSize = Math.floor(privateKey.asymmetricKeyDetails!.modulusLength! / 8);

  if (data.length === chunkSize) {
    return privateDecrypt(privateKey, data);
  }

  const length = Math.ceil(data.length / chunkSize);

  const chunks = Array.from({ length })
    .map((_, ix) => data.subarray(ix * chunkSize, ix < length - 1 ? (ix + 1) * chunkSize : undefined))
    .map((chunkData) => privateDecrypt(privateKey, chunkData));

  return Buffer.concat(chunks);
}
