import Form from '@apptoolkit/form';
import type { NewAccount } from '@controllers/signUp';
import signUp from '@controllers/signUp';
import { APIError } from 'errors';
import { Draft07, validateAsync } from 'json-schema-library';
import { MongoServerError } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

const jsonSchema = new Draft07({
  description: 'User credentials',
  properties: {
    email: {
      pattern: Form.commonValidators.patterns.email.source,
      type: 'string',
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    password: {
      minLength: 8,
      pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$',
      type: 'string',
    },
  },
  required: ['email', 'firstName', 'lastName', 'password'],
  title: 'NewAccount',
  type: 'object',
});

export interface SignUpApiResponse {
  error?: string;
  jwt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignUpApiResponse>) {
  try {
    const body: NewAccount = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = await validateAsync(jsonSchema, body);

    if (isValid.length) {
      throw new APIError(400, 'Invalid new Account', isValid);
    }

    const { email, firstName, lastName, password } = body as NewAccount;

    const jwt = await signUp({ email, firstName, lastName, password });

    return res.json({ jwt });
  } catch (error) {
    if (error instanceof APIError) {
      res.statusCode = error.code;
      return res.json({ error: error.message });
    }

    if (error instanceof MongoServerError && error.message.includes('E11000')) {
      res.statusCode = 400;
      return res.json({ error: 'Account already exist' });
    }

    console.error(error);

    res.statusCode = 500;
    res.end();
  }
}
