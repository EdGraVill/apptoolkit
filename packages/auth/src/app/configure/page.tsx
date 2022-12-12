import { generate2FASecret } from '@apptoolkit/2fa';

import Head from 'next/head';
import { redirect } from 'next/navigation';

import { AlreadyConfigured, Configure } from '@components/screens';
import useJWT from '@hooks/server/useJWT';
import useSessionAccount from '@hooks/server/useSessionAccount';

export default async function ConfigurePage({ searchParams }: any) {
  const jwt = await useJWT(searchParams.jwt);

  if (!jwt) {
    redirect('/');
  }

  if (jwt.is2FAEnabled) {
    return (
      <>
        <Head>
          <title>2FA Already set</title>
        </Head>
        <AlreadyConfigured jwt={jwt.jwt} />;
      </>
    );
  }

  const account = await useSessionAccount(jwt);

  if (!account) {
    redirect('/logout');
  }

  const { qr, secret, uri } = generate2FASecret(account.email);

  return (
    <>
      <Head>
        <title>Configure 2FA</title>
      </Head>
      <Configure qr={qr.toString()} secret={secret} uri={uri.toString()} />
    </>
  );
}
