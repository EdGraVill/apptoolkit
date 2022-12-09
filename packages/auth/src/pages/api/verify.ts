import { verify2FAPasscode } from '@apptoolkit/2fa';
import { signJWT, verifyJWT } from '@apptoolkit/jwt';
import { decrypt } from '@apptoolkit/rsa';
import Account from '@controllers/acoount';
import { getCookie, setCookie } from 'cookies-next';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

const jsonSchema = new Draft07({
  description: 'User credentials',
  properties: {
    code: {
      pattern: '^[0-9]{6,}$',
      type: 'string',
    },
  },
  required: ['code'],
  title: 'Credentials',
  type: 'object',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ jwt: string }>) {
  try {
    const body: { code: string } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new Error(isValid.join(', '));
    }

    const jwt =
      req.headers.authorization?.replace('Bearer ', '') ??
      getCookie('jwt', { req, res })?.toString() ??
      req.query.jwt?.toString();

    if (!jwt) {
      throw new Error('No JWT provided');
    }

    const { email } = await verifyJWT(jwt);

    await Account.connect();
    const account = await Account.read({ email });
    await Account.disconnect();

    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.secret) {
      throw new Error('Account has not 2FA enabled');
    }

    const bin = await decrypt(account.secret.buffer as Buffer);

    const response = verify2FAPasscode(bin, body.code);

    if (!response) {
      throw new Error('Verifaction code failed');
    }

    const newJWT = await signJWT({ auth: true, email, is2FAEnabled: true });
    setCookie('jwt', newJWT, { req, res });

    return res.json({ jwt: newJWT });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }

    res.statusCode = 500;
    res.end();
  }
}
