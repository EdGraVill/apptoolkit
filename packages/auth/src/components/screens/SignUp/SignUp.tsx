import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';

import { useDelayedEffect } from '@hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { FullCard } from '@components/surfaces';
import type { NewAccount } from '@controllers/signUp';
import type { SignUpApiResponse } from '@pages/api/signup';

import inputDefinitions from './inputDefinitions';

interface Props {
  onSignUp(credentials: NewAccount): Promise<SignUpApiResponse>;
}

const SignUp: FC<Props> = ({ onSignUp }) => {
  const { push } = useRouter();
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useDelayedEffect(
    5_000,
    () => {
      setError((previousError) => {
        if (!previousError) {
          return previousError;
        }

        return undefined;
      });
    },
    [error],
  );

  const onSubmit = useCallback(async (context: Context) => {
    setLoadingState(true);
    const isValid = context.isValid(['email', 'password', 'firstName', 'lastName']);
    const [email, password, firstName, lastName] = context.getManyValues([
      'email',
      'password',
      'firstName',
      'lastName',
    ]);

    if (isValid && email && password && firstName && lastName) {
      try {
        const { error, jwt } = await onSignUp({ email, firstName, lastName, password });
        if (error) {
          throw error;
        }

        push(`/configure?jwt=${jwt}`);
      } catch (error) {
        if (typeof error === 'string') {
          setError(error);
        }
      } finally {
        setLoadingState(false);
      }
    } else {
      setLoadingState(false);
    }
  }, []);

  return (
    <FullCard>
      <h1
        className={`border-l-8 py-2 pl-5 text-left font-sans text-3xl font-semibold ${
          error ? 'border-l-error-800 text-error-800' : 'border-l-primary-500'
        }`}
      >
        Sign Up
      </h1>
      {!!error && (
        <div className="border-l-8 border-l-error-800 bg-error-300 p-2 text-center text-sm font-semibold text-error-800">
          {error}
        </div>
      )}
      <div className="mx-auto my-10 grid max-w-xs grid-cols-1 gap-y-6">
        <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-x-5">
            <TextInput label="First Name" name="firstName" />
            <TextInput label="Last Name" name="lastName" />
          </div>
          <TextInput label="Email" name="email" type="email" />
          <TextInput label="Password" name="password" type="password" />
          <Form.HTMLInputWrapper>
            {({ formContext }) => (
              <Button
                className="border-0 bg-primary-500 text-white transition-colors hover:bg-primary-600"
                isDisabled={isLoading}
                isLoading={isLoading}
                onClick={formContext.submit}
              >
                Send
              </Button>
            )}
          </Form.HTMLInputWrapper>
        </Form>
      </div>
      <p className="text-center text-sm text-gray-500">
        If you already have an accout.{' '}
        <Link className="text-primary-600 hover:underline" href="/">
          Sign In
        </Link>
      </p>
    </FullCard>
  );
};

export default SignUp;
