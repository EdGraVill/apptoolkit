import { SignUp } from '@components/screens';
import type { Credentials } from '@controllers/signIn';
import Head from 'next/head';
import { useCallback, useEffect, useRef } from 'react';

export default function SignUpPage() {
  const controller = useRef(new AbortController());

  const onSignUp = useCallback(async (credentials: Credentials): Promise<string> => {
    controller.current = new AbortController();

    const request = await fetch('/api/signup', {
      body: JSON.stringify(credentials),
      method: 'POST',
      signal: controller.current.signal,
    });
    const response = await request.json();

    return response?.jwt;
  }, []);

  useEffect(() => {
    return () => {
      controller.current.abort();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <SignUp onSignUp={onSignUp} />x
    </>
  );
}
