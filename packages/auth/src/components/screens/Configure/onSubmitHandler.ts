import type { Context } from '@apptoolkit/form';

import type { ConfigureAPIResponse } from '@api/configure';
import type { Configure2FA } from '@controllers/configure';

export default async function onSubmitHandler(
  context: Context,
  secret: string,
  onConfigure: (credentials: Configure2FA) => Promise<ConfigureAPIResponse>,
): Promise<string> {
  const isValid = context.isValid('code');
  const code = context.getValue('code');

  if (isValid && code) {
    const { error, jwt } = await onConfigure({ code, secret });
    if (error) {
      throw error;
    }

    return jwt ?? '';
  } else {
    throw 'Invalid code';
  }
}
