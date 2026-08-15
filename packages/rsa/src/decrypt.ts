/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { privateDecrypt } from 'crypto';

import getKeyPair from './getKeyPair';

export default async function decrypt(data: Buffer) {
  const { privateKey } = await getKeyPair();
  const chunkSize = Math.floor(privateKey.asymmetricKeyDetails!.modulusLength! / 8);
  const bytes = Uint8Array.from(data);

  if (bytes.length === chunkSize) {
    return privateDecrypt(privateKey, bytes);
  }

  const length = Math.ceil(bytes.length / chunkSize);

  const chunks = Array.from({ length })
    .map((_, ix) => bytes.subarray(ix * chunkSize, ix < length - 1 ? (ix + 1) * chunkSize : undefined))
    .map((chunkData) => privateDecrypt(privateKey, chunkData));

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return Buffer.from(merged);
}
