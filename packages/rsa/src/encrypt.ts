/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { publicEncrypt } from 'crypto';

import getKeyPair from './getKeyPair';

export default async function encrypt(data: Buffer) {
  const { publicKey } = await getKeyPair();
  const chunkSize = Math.floor(publicKey.asymmetricKeyDetails!.modulusLength! / 8);
  const maxLength = Math.floor(chunkSize * 0.9);
  const bytes = Uint8Array.from(data);

  if (bytes.length < maxLength) {
    return publicEncrypt(publicKey, bytes);
  }

  const length = Math.ceil(bytes.length / maxLength);

  const chunks = Array.from({ length })
    .map((_, ix) => bytes.subarray(ix * maxLength, ix < length - 1 ? (ix + 1) * maxLength : undefined))
    .map((chunkData) => publicEncrypt(publicKey, chunkData));

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return Buffer.from(merged);
}
