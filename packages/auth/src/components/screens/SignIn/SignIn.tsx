import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { FullCard } from '@components/surfaces';
import type { Credentials } from '@controllers/signIn';

import inputDefinitions from './inputDefinitions';

interface Props {
  onSignIn(credentials: Credentials): Promise<string>;
}

const SignIn: FC<Props> = ({ onSignIn }) => {
  const { push } = useRouter();
  const [isLoading, setLoadingState] = useState(false);

  const onSubmit = useCallback(async (context: Context) => {
    setLoadingState(true);
    const isValid = context.isValid(['email', 'password']);
    const [email, password] = context.getManyValues(['email', 'password']);

    if (isValid && email && password) {
      try {
        const jwt = await onSignIn({ email, password });

        const url = new URL(process.env.ON_SIGN_IN_URL ?? 'http://localhost:3000/test');
        url.searchParams.set('jwt', jwt);

        console.log(url);

        push(url.toString());
      } catch (error) {
        setLoadingState(false);
      }
    } else {
      setLoadingState(false);
    }
  }, []);

  return (
    <FullCard>
      <h1 className="border-l-8 border-l-violet-500 py-2 pl-5 text-left font-sans text-3xl font-semibold">Sign In</h1>
      <div className="mx-auto my-10 grid max-w-xs grid-cols-1 gap-y-6">
        <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
          <TextInput label="Email" name="email" />
          <TextInput label="Password" name="password" type="password" />
          <Form.HTMLInputWrapper>
            {({ formContext }) => (
              <Button
                className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-500"
                isDisabled={isLoading}
                isLoading={isLoading}
                onClick={formContext.submit}
              >
                Enter
              </Button>
            )}
          </Form.HTMLInputWrapper>
        </Form>
      </div>
      <p className="text-center text-sm text-gray-500">
        If you still don&apos;t have an accout.{' '}
        <Link className="text-violet-600 hover:underline" href="/signup">
          Sign Up
        </Link>
      </p>
    </FullCard>
  );
};

export default SignIn;
