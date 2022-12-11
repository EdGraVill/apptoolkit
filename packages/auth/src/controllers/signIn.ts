import { signJWT } from '@apptoolkit/jwt';

import { compare } from 'bcrypt';

import type { AccountFields } from './acoount';
import Account from './acoount';

export type Credentials = Pick<AccountFields, 'email' | 'password'>;

export default async function signIn({ email, password }: Credentials) {
  await Account.connect();
  const account = await Account.read({ email });
  await Account.disconnect();

  if (!account) {
    throw new Error('Account not found');
  }

  const storedPassword = account.password;
  const isPasswordCorrect = await compare(password, storedPassword);

  if (!isPasswordCorrect) {
    throw new Error('Password incorrect');
  }

  const jwt = await signJWT({ auth: !account.secret, email, is2FAEnabled: !!account.secret });

  return jwt;
}
