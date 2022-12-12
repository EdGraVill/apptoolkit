import type { JWTPayload } from '@apptoolkit/jwt';
import { verifyJWT } from '@apptoolkit/jwt';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function (jwt?: string): Promise<(JWTPayload & { jwt: string }) | undefined> {
  const headersList = headers();
  const { get: getCookie } = cookies();
  const authorization = jwt ?? headersList.get('authorization')?.replace('Bearer ', '') ?? getCookie('jwt')?.value;

  if (!authorization) {
    return undefined;
  }

  try {
    const payload = await verifyJWT(authorization);

    return {
      ...payload,
      jwt: authorization,
    };
  } catch (error) {
    // Clear cookies
    return redirect('/signout');
  }
}
