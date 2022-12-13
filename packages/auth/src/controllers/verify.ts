import { verify2FAPasscode } from '@apptoolkit/2fa';
import type { JWTPayload } from '@apptoolkit/jwt';
import { signJWT } from '@apptoolkit/jwt';
import { decrypt } from '@apptoolkit/rsa';

import { APIError } from 'errors';

import Account from './acoount';

export default async function verify({ email }: JWTPayload, code: string): Promise<string> {
  await Account.connect();
  const account = await Account.read({ email });
  await Account.disconnect();

  if (!account) {
    throw new APIError(401, 'Account not found');
  }

  if (!account.secret) {
    throw new APIError(401, 'Account has not 2FA enabled');
  }

  const bin = await decrypt(account.secret.buffer as Buffer);

  const response = verify2FAPasscode(bin, code);

  if (!response) {
    throw new APIError(400, 'Verifaction code failed');
  }

  const newJWT = await signJWT({ auth: true, email, is2FAEnabled: true });

  return newJWT;
}
