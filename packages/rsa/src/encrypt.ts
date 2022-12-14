/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { publicEncrypt } from 'crypto';

import getKeyPair from './getKeyPair';

export default async function encrypt(data: Buffer) {
  const { publicKey } = await getKeyPair();
  const chunkSize = Math.floor(publicKey.asymmetricKeyDetails!.modulusLength! / 8);
  const maxLength = Math.floor(chunkSize * 0.9);

  if (data.length < maxLength) {
    return publicEncrypt(publicKey, data);
  }

  const length = Math.ceil(data.length / maxLength);

  const chunks = Array.from({ length })
    .map((_, ix) => data.subarray(ix * maxLength, ix < length - 1 ? (ix + 1) * maxLength : undefined))
    .map((chunkData) => publicEncrypt(publicKey, chunkData));

  return Buffer.concat(chunks);
}
