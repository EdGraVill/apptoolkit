import type { Context } from '@apptoolkit/form';

import type { onSignIn as onSignInHandler } from '@handlers';

export default async function onSubmitHandler(context: Context, onSignIn: typeof onSignInHandler): Promise<string> {
  const isValid = context.isValid(['email', 'password']);
  const [email, password] = context.getManyValues(['email', 'password']);

  if (isValid && email && password) {
    const { error, jwt } = await onSignIn({ email, password });
    if (error) {
      throw error;
    }

    return jwt ?? '';
  } else {
    throw 'Some fields are not valid';
  }
}
