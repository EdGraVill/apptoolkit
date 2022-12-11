import Head from 'next/head';
import { useCallback, useEffect, useRef } from 'react';

import { SignIn } from '@components/screens';
import type { Credentials } from '@controllers/signIn';

export default function SignInPage() {
  const controller = useRef(new AbortController());

  const onSignIn = useCallback(async (credentials: Credentials): Promise<string> => {
    controller.current = new AbortController();

    const request = await fetch('/api/signin', {
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
        <title>Sign In</title>
      </Head>
      <SignIn onSignIn={onSignIn} />x
    </>
  );
}
