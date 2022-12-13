import { redirect } from 'next/navigation';

import { Verify } from '@components/screens';
import useJWT from '@hooks/server/useJWT';

export default async function VerifyPage({ searchParams }: any) {
  const jwt = await useJWT(searchParams.jwt);

  if (!jwt) {
    return redirect('/');
  }

  if (!jwt.is2FAEnabled) {
    return redirect('/configure');
  }

  return <Verify />;
}
