import { redirect } from 'next/navigation';

import { Verify } from '@components/screens';
import useJWT from '@hooks/server/useJWT';
import type { PageComponent } from '../../../.next/types/app/page';

export default async function VerifyPage({ searchParams }: Parameters<PageComponent>[0]) {
  const jwt = await useJWT(searchParams.jwt);

  if (!jwt) {
    return redirect('/');
  }

  if (!jwt.is2FAEnabled) {
    return redirect('/configure');
  }

  return <Verify />;
}
