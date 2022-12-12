import { verifyJWT } from '@apptoolkit/jwt';

import { getCookie, setCookie } from 'cookies-next';
import { APIError } from 'errors';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

import type { Configure2FA } from '@controllers/configure';
import configure from '@controllers/configure';

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

export interface ConfigureAPIResponse {
  error?: string;
  jwt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfigureAPIResponse>) {
  try {
    const body: Configure2FA = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new APIError(400, 'Invalid code');
    }

    const jwt =
      req.headers.authorization?.replace('Bearer ', '') ??
      getCookie('jwt', { req, res })?.toString() ??
      req.query.jwt?.toString();

    if (!jwt) {
      throw new APIError(401, 'Unauthorized');
    }

    const jwtPayload = await verifyJWT(jwt);

    const newJWT = await configure(jwtPayload, body);

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
