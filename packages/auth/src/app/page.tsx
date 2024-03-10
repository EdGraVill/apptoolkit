import Head from 'next/head';
import { redirect } from 'next/navigation';

import { SignIn } from '@components/screens';
import useJWT from '@hooks/server/useJWT';
import useSessionAccount from '@hooks/server/useSessionAccount';
import type { PageComponent } from '../../.next/types/app/page';

export default async function SignUpPage({ searchParams }: Parameters<PageComponent>[0]) {
  const jwt = await useJWT(searchParams.jwt);
  const account = await useSessionAccount(jwt);

  if (account && jwt?.jwt) {
    const url = new URL(process.env.NEXT_PUBLIC_ON_SIGN_IN_URL ?? 'http://localhost:3000/test');
    url.searchParams.set('jwt', jwt.jwt);
    redirect(url.toString());
  }

  if (jwt?.jwt && !account) {
    redirect('/signout');
  }

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <SignIn />
    </>
  );
}
