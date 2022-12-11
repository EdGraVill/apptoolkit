import inputDefinitions from './inputDefinitions';
import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';
import { FullCard } from '@components/surfaces';
import type { Credentials } from '@controllers/signIn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

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
      <h1 className="text-3xl text-left pl-5 py-2 font-semibold font-sans border-l-8 border-l-violet-500">Sign In</h1>
      <div className="max-w-xs mx-auto my-10 grid-cols-1 gap-y-6 grid">
        <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
          <TextInput label="Email" name="email" />
          <TextInput label="Password" name="password" type="password" />
          <Form.HTMLInputWrapper>
            {({ formContext }) => (
              <Button
                className="border-0 bg-violet-500 text-white hover:bg-violet-500 transition-colors"
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
      <p className="text-sm text-center text-gray-500">
        If you still don&apos;t have an accout.{' '}
        <Link className="text-violet-600 hover:underline" href="/signup">
          Sign Up
        </Link>
      </p>
    </FullCard>
  );
};

export default SignIn;
