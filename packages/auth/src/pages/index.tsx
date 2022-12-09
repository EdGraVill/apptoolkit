import SignIn from '@components/screens/SignIn';
import type { Credentials } from '@controllers/signIn';
import Head from 'next/head';
import { useCallback, useEffect, useRef } from 'react';

export default function Home() {
  const controller = useRef(new AbortController());

  const onSignIn = useCallback(async (credentials: Credentials) => {
    console.log(credentials);
    controller.current = new AbortController();
    const request = await fetch('/api/signin', { signal: controller.current.signal });
    await request.json();
  }, []);

  useEffect(() => {
    // @ts-ignore
    globalThis.controller = controller.current;
  }, []);

  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <SignIn onSignIn={onSignIn} />
    </>
  );
}
