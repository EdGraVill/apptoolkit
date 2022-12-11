import Head from 'next/head';
import { useCallback, useEffect, useRef } from 'react';

import { SignUp } from '@components/screens';
import type { Credentials } from '@controllers/signIn';
import type { SignUpApiResponse } from '@pages/api/signup';

export default function SignUpPage() {
  const controller = useRef(new AbortController());

  const onSignUp = useCallback(async (credentials: Credentials): Promise<SignUpApiResponse> => {
    controller.current = new AbortController();

    const request = await fetch('/api/signup', {
      body: JSON.stringify(credentials),
      method: 'POST',
      signal: controller.current.signal,
    });
    const response = await request.json();

    return response;
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
