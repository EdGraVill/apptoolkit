import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { LayoutTitle } from '@components/layout/Loader';
import type { onSignUp } from '@handlers';
import { useFleetingState } from '@hooks';

import inputDefinitions from './inputDefinitions';
import onSubmitHandler from './onSubmitHandler';

interface Props {
  onSignUp: typeof onSignUp;
}

const SignUp: FC<Props> = ({ onSignUp }) => {
  const { push } = useRouter();
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useFleetingState<string>(3_000);

  const onSubmit = useCallback(async (context: Context) => {
    setLoadingState(true);
    try {
      await onSubmitHandler(context, onSignUp);

      push(`/configure`);
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
      <LayoutTitle error={error}>Sign Up</LayoutTitle>
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
      <p className="my-10 text-center text-sm text-gray-500">
        If you already have an accout.{' '}
        <Link className="text-primary-600 hover:underline" href="/">
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;
