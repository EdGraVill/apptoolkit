import type { Context } from '@apptoolkit/form';

import type { SignInApiResponse } from '@api/signin';
import type { onSignIn as onSignInHandler } from '@handlers';

export default async function onSubmitHandler(
  context: Context,
  onSignIn: typeof onSignInHandler,
): Promise<Required<Omit<SignInApiResponse, 'error' | 'email'>>> {
  const isValid = context.isValid(['email', 'password']);
  const [email, password] = context.getManyValues(['email', 'password']);

  if (isValid && email && password) {
    const { auth, error, is2FAEnabled, jwt } = await onSignIn({ email, password });
    if (error) {
      throw error;
    }

    if (typeof auth !== 'undefined' && typeof is2FAEnabled !== 'undefined' && typeof jwt !== 'undefined') {
      return { auth, is2FAEnabled, jwt };
    }

    throw 'Unexpected error';
  } else {
    throw 'Some fields are not valid';
  }
}
