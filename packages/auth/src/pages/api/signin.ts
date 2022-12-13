import Form from '@apptoolkit/form';
import type { JWTPayload } from '@apptoolkit/jwt';

import { setCookie } from 'cookies-next';
import { APIError } from 'errors';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

import type { Credentials } from '@controllers/signIn';
import signIn from '@controllers/signIn';

const jsonSchema = new Draft07({
  description: 'User credentials',
  properties: {
    email: {
      pattern: Form.commonValidators.patterns.email.source,
      type: 'string',
    },
    password: {
      minLength: 8,
      pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$',
      type: 'string',
    },
  },
  required: ['email', 'password'],
  title: 'Credentials',
  type: 'object',
});

export type SignInApiResponse = {
  error?: string;
  jwt?: string;
} & Partial<JWTPayload>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignInApiResponse>) {
  try {
    const body: Credentials = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new Error(isValid.join(', '));
    }

    const { email, password } = body;

    const { auth, is2FAEnabled, jwt } = await signIn({ email, password });
    setCookie('jwt', jwt, { req, res });

    return res.json({ auth, email, is2FAEnabled, jwt });
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
