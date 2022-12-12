import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';

import type { onSignIn } from '@handlers';
import { useFleetingState, useJWTResolver } from '@hooks';
import Link from 'next/link';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { LayoutTitle } from '@components/layout/Loader';

import inputDefinitions from './inputDefinitions';
import onSubmitHandler from './onSubmitHandler';

interface Props {
  onSignIn: typeof onSignIn;
}

const SignIn: FC<Props> = ({ onSignIn }) => {
  const resolver = useJWTResolver();
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useFleetingState<string>(3_000);

  const onSubmit = useCallback(async (context: Context) => {
    setLoadingState(true);
    try {
      const jwt = await onSubmitHandler(context, onSignIn);

      resolver(jwt);
    } catch (error) {
      if (typeof error === 'string') {
        setError(error);
      }
    } finally {
      setLoadingState(false);
    }
  }, []);

  return (
    <>
      <LayoutTitle error={error}>Sign In</LayoutTitle>
      <div className="mx-auto my-10 grid max-w-xs grid-cols-1 gap-y-6">
        <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
          <TextInput label="Email" name="email" />
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
      <p className="my-10 text-center text-sm text-gray-500">
        If you still don&apos;t have an accout.{' '}
        <Link className="text-violet-600 hover:underline" href="/signup">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default SignIn;
