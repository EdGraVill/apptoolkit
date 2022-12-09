import { verifyJWT } from '@apptoolkit/jwt';
import Verify from '@components/screens/Verify';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function VerifyPage({ searchParams }: { searchParams: { jwt?: string } }) {
  const headersList = headers();
  const { get } = cookies();
  const authorization =
    headersList.get('authorization')?.replace('Bearer ', '') ?? get('jwt')?.value ?? searchParams.jwt;

  if (!authorization) {
    return redirect('/');
  }

  const { is2FAEnabled } = await verifyJWT(authorization);

  if (!is2FAEnabled) {
    return redirect('/configure');
  }

  return <Verify />;
}
