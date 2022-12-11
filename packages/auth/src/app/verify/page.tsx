import { verifyJWT } from '@apptoolkit/jwt';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Verify from '@components/screens/Verify';

export default async function VerifyPage({ params }: any) {
  const headersList = headers();
  const { get: getCookie } = cookies();
  const authorization =
    headersList.get('authorization')?.replace('Bearer ', '') ?? getCookie('jwt')?.value ?? params?.jwt;

  if (!authorization) {
    return redirect('/');
  }

  const { is2FAEnabled } = await verifyJWT(authorization);

  if (!is2FAEnabled) {
    return redirect('/configure');
  }

  return <Verify />;
}
