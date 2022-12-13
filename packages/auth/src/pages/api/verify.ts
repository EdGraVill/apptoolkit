import { verifyJWT } from '@apptoolkit/jwt';

import { getCookie, setCookie } from 'cookies-next';
import { APIError } from 'errors';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

import verify from '@controllers/verify';

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

export interface VerifyApiResponse {
  error?: string;
  jwt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyApiResponse>) {
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
      throw new APIError(401, 'Unauthorized');
    }

    const jwtPayload = await verifyJWT(jwt);

    const newJWT = await verify(jwtPayload, body.code);
    setCookie('jwt', newJWT, { req, res });

    return res.json({ jwt: newJWT });
  } catch (error) {
    if (error instanceof APIError) {
      res.statusCode = error.code;
      return res.json({ error: error.message });
    }

    console.error(error);

    res.statusCode = 500;
    res.end();
  }
}
