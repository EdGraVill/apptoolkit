import inputDefinitions from './inputDefinitions';
import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';
import { FullCard } from '@components/surfaces';
import type { NewAccount } from '@controllers/signUp';
import { useDelayedEffect } from '@hooks';
import type { SignUpApiResponse } from '@pages/api/signup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useCallback, useState } from 'react';

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
        className={`text-3xl text-left pl-5 py-2 font-semibold font-sans border-l-8 ${
          error ? 'border-l-error-800 text-error-800' : 'border-l-primary-500'
        }`}
      >
        Sign Up
      </h1>
      {!!error && (
        <div
          className={`bg-error-300 text-error-800 font-semibold text-center text-sm p-2 border-l-8 border-l-error-800`}
        >
          {error}
        </div>
      )}
      <div className="max-w-xs mx-auto my-10 grid-cols-1 gap-y-6 grid">
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
                className="border-0 bg-primary-500 text-white hover:bg-primary-600 transition-colors"
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
      <p className="text-sm text-center text-gray-500">
        If you already have an accout.{' '}
        <Link className="text-primary-600 hover:underline" href="/">
          Sign In
        </Link>
      </p>
    </FullCard>
  );
};

export default SignUp;
