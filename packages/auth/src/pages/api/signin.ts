import Form from '@apptoolkit/form';
import type { Credentials } from '@controllers/signIn';
import signIn from '@controllers/signIn';
import { setCookie } from 'cookies-next';
import { Draft07, validateAsync } from 'json-schema-library';
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ jwt: string }>) {
  try {
    const body: Credentials = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new Error(isValid.join(', '));
    }

    const { email, password } = body;

    const jwt = await signIn({ email, password });
    setCookie('jwt', jwt, { req, res });

    return res.json({ jwt });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }

    res.statusCode = 500;
    res.end();
  }
}