import type { AccountFields } from './acoount';
import Account from './acoount';
import { signJWT } from '@apptoolkit/jwt';
import { compare } from 'bcrypt';

export type Credentials = Pick<AccountFields, 'email' | 'password'>;

export default async function signIn({ email, password }: Credentials) {
  await Account.connect();
  const account = await Account.read({ email });

  if (!account) {
    throw new Error('Account not found');
  }

  const storedPassword = account.password;
  const isPasswordCorrect = await compare(password, storedPassword);

  if (!isPasswordCorrect) {
    throw new Error('Password incorrect');
  }

  const jwt = await signJWT({ auth: !account.secret, email, is2FAEnabled: !!account.secret });
  await Account.disconnect();

  return jwt;
}
