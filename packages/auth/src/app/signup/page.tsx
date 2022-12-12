import Head from 'next/head';
import { redirect } from 'next/navigation';

import { SignUp } from '@components/screens';
import useJWT from '@hooks/server/useJWT';
import useSessionAccount from '@hooks/server/useSessionAccount';

export default async function SignUpPage({ searchParams }: any) {
  const jwt = await useJWT(searchParams.jwt);
  const account = await useSessionAccount(jwt);

  if (account) {
    redirect('/');
  }

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <SignUp />;
    </>
  );
}
