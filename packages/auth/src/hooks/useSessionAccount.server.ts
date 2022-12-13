import type { CRUDFind } from '@apptoolkit/crud';
import type { JWTPayload } from '@apptoolkit/jwt';

import Account from '@controllers/acoount';

export default async function (
  payload?: JWTPayload,
): Promise<CRUDFind<typeof Account, typeof Account['fields']> | undefined> {
  if (!payload) {
    return undefined;
  }

  await Account.connect();
  const account = await Account.read({ email: payload.email });
  await Account.disconnect();

  return account;
}
