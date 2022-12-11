import { decodeSecret, verify2FAPasscode } from '@apptoolkit/2fa';
import { signJWT, verifyJWT } from '@apptoolkit/jwt';
import { encrypt } from '@apptoolkit/rsa';

import { getCookie, setCookie } from 'cookies-next';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

import Account from '@controllers/acoount';

const jsonSchema = new Draft07({
  description: 'User credentials',
  properties: {
    code: {
      pattern: '^[0-9]{6,}$',
      type: 'string',
    },
    secret: {
      pattern: '^[A-Z0-9]{32,}$',
      type: 'string',
    },
  },
  required: ['code', 'secret'],
  title: 'Credentials',
  type: 'object',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ jwt: string }>) {
  try {
    const body: { code: string; secret: string } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new Error(isValid.join(', '));
    }

    const bin = decodeSecret(body.secret);
    const jwt =
      req.headers.authorization?.replace('Bearer ', '') ??
      getCookie('jwt', { req, res })?.toString() ??
      req.query.jwt?.toString();

    if (!jwt) {
      throw new Error('No JWT provided');
    }

    const { email } = await verifyJWT(jwt);

    const response = verify2FAPasscode(bin, body.code);

    if (!response) {
      throw new Error('Verifaction code failed');
    }

    await Account.connect();
    const account = await Account.read({ email });

    if (!account) {
      throw new Error('Account not found');
    }

    const secret = await encrypt(bin);
    await account.update({ secret });
    await Account.disconnect();

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
