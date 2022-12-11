import { signJWT } from '@apptoolkit/jwt';

import { hash } from 'bcrypt';

import type { AccountFields } from './acoount';
import Account from './acoount';

export type NewAccount = Pick<AccountFields, 'email' | 'firstName' | 'lastName' | 'password'>;

export default async function signUp({ email, firstName, lastName, password }: NewAccount) {
  const hasehdPassword = await hash(password, 10);

  await Account.connect();
  await Account.create({ email, firstName, lastName, password: hasehdPassword });
  await Account.disconnect();

  const jwt = await signJWT({ auth: false, email, is2FAEnabled: false }, '1h');

  return jwt;
}
