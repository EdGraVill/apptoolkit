import type { Context } from '@apptoolkit/form';

import type { onConfigure as onConfigureHandler } from '@handlers';

export default async function onSubmitHandler(
  context: Context,
  secret: string,
  onConfigure: typeof onConfigureHandler,
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
