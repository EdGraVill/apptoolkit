import { decodeSecret, verify2FAPasscode } from '@apptoolkit/2fa';
import type { JWTPayload } from '@apptoolkit/jwt';
import { signJWT } from '@apptoolkit/jwt';
import { encrypt } from '@apptoolkit/rsa';

import { APIError } from 'errors';

import Account from './acoount';

export interface Configure2FA {
  code: string;
  secret: string;
}

export default async function configure({ email }: JWTPayload, { code, secret }: Configure2FA): Promise<string> {
  const bin = decodeSecret(secret);
  const response = verify2FAPasscode(bin, code);

  if (!response) {
    throw new APIError(400, 'Verifaction code failed');
  }

  await Account.connect();
  const account = await Account.read({ email });

  if (!account) {
    throw new APIError(401, 'Account not found');
  }

  const encryptedBin = await encrypt(bin);
  await account.update({ secret: encryptedBin });
  await Account.disconnect();

  const newJWT = await signJWT({ auth: true, email, is2FAEnabled: true });

  return newJWT;
}
