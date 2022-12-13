import type { JWTPayload } from '@apptoolkit/jwt';
import { signJWT } from '@apptoolkit/jwt';

import { compare } from 'bcrypt';
import { APIError } from 'errors';

import type { AccountFields } from './acoount';
import Account from './acoount';

export type Credentials = Pick<AccountFields, 'email' | 'password'>;

export default async function signIn({ email, password }: Credentials): Promise<JWTPayload & { jwt: string }> {
  await Account.connect();
  const account = await Account.read({ email });
  await Account.disconnect();

  if (!account) {
    throw new APIError(401, 'Wrong credentials', new Error('Account not found'));
  }

  const storedPassword = account.password;
  const isPasswordCorrect = await compare(password, storedPassword);

  if (!isPasswordCorrect) {
    throw new APIError(401, 'Wrong credentials', new Error('Password incorrect'));
  }

  const auth = !account.secret;
  const is2FAEnabled = !!account.secret;

  const jwt = await signJWT({ auth, email, is2FAEnabled });

  return {
    auth,
    email,
    is2FAEnabled,
    jwt,
  };
}
