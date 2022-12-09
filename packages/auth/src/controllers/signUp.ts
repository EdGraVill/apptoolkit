import type { AccountFields } from './acoount';
import Account from './acoount';
import { hash } from 'bcrypt';

export type Credentials = Pick<AccountFields, 'email' | 'password'>;

export default async function signUp({ email, password }: Credentials) {
  await Account.connect();

  const hasehdPassword = await hash(password, 10);

  await Account.create({ email, password: hasehdPassword });

  await Account.disconnect();
}
