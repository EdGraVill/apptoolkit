import type { Context } from '@apptoolkit/form';

import type { onVerify as onVerifyHandler } from '@handlers';

export default async function onSubmitHandler(context: Context, onVerify: typeof onVerifyHandler): Promise<string> {
  const isValid = context.isValid('code');
  const code = context.getValue('code');

  if (isValid && code) {
    const { error, jwt } = await onVerify(code);
    if (error) {
      throw error;
    }

    return jwt ?? '';
  } else {
    throw 'Invalid code';
  }
}
