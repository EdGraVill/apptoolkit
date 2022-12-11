import { generate2FASecret } from '@apptoolkit/2fa';
import { verifyJWT } from '@apptoolkit/jwt';
import { AlreadyConfigured, ShowQR } from '@components/screens/Configure';
import Account from '@controllers/acoount';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Configure({ searchParams }: { searchParams: Record<string, string> }) {
  const headersList = headers();
  const { get: getCookie } = cookies();
  const authorization =
    headersList.get('authorization')?.replace('Bearer ', '') ?? getCookie('jwt')?.value ?? searchParams.jwt;

  if (!authorization) {
    return redirect('/');
  }

  const { email, is2FAEnabled } = await verifyJWT(authorization);

  if (is2FAEnabled) {
    return <AlreadyConfigured />;
  }

  await Account.connect();
  const account = await Account.read({ email });
  await Account.disconnect();

  if (!account) {
    throw new Error('Account disabled');
  }

  const { qr, secret, uri } = generate2FASecret(email);
  console.log(secret);

  return <ShowQR qr={qr.toString()} secret={secret} uri={uri.toString()} />;
}
