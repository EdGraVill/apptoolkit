import { generate2FASecret, verify2FAPasscode } from '../2fa';
import { connectToDB, createIndex } from '../db/dbConnection';
import { signJWT, verifyJWT } from '../jwt/jwt';
import { encrypt } from '@apptoolkit/rsa';
import { compare, hash } from 'bcrypt';

interface Credentials {
  email: string;
  password: string;
}

export async function signUp({ email, password }: Credentials) {
  const connection = await connectToDB();

  const hashedPassword = await hash(password, 10);
  const { bin, ...secret } = generate2FASecret(email);

  await createIndex('accounts', 'email', { unique: true });

  const newUser = await connection
    .db()
    .collection('accounts')
    .insertOne({
      email,
      password: hashedPassword,
      secret: encrypt(bin),
    });

  return { ...newUser, ...secret };
}

export async function signIn({ email, password }: Credentials) {
  const connection = await connectToDB();

  const Account = await connection.db().collection('accounts').findOne({ email });

  if (!Account) {
    throw new Error(''); // TODO
  }

  const matchPassword = await compare(password, Account.password);

  if (!matchPassword) {
    throw new Error(''); // TODO
  }

  const is2FAEnabled = Account.is2FAEnabled;

  const token = await signJWT(
    {
      auth: !is2FAEnabled,
      email: Account.email,
      is2FAEnabled,
    },
    is2FAEnabled ? '30d' : '90d',
  );

  return token;
}

export async function auth(jwt: string, passcode: string) {
  const connection = await connectToDB();
  const payload = await verifyJWT(jwt);

  const Account = await connection.db().collection('accounts').findOne({ email: payload.email });

  if (!Account) {
    throw new Error(''); // TODO
  }

  const result = verify2FAPasscode(Account.secret, passcode);

  if (!result?.delta) {
    throw new Error(''); // TODO
  }

  const newJWT = await signJWT({ ...payload, auth: true });

  return newJWT;
}
