import Head from 'next/head';

import { SignIn } from '@components/screens';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <SignIn />
    </>
  );
}
