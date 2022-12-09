import Form from '@apptoolkit/form';
import type { Credentials } from '@controllers/signIn';
import signIn from '@controllers/signIn';
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

export default async function handle(req: NextApiRequest, res: NextApiResponse<{ jwt: string }>) {
  const isValid = await validateAsync(jsonSchema, req.body);

  if (isValid.length) {
    res.statusCode = 400;
    return res.end();
  }

  const { email, password } = req.body as Credentials;

  try {
    const jwt = await signIn({ email, password });

    return res.json({ jwt });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }

    res.statusCode = 500;
    res.end();
  }
}
