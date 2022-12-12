import type { Context } from '@apptoolkit/form';

import type { onSignUp as onSignUpHandler } from '@handlers';

export default async function onSubmitHandler(context: Context, onSignUp: typeof onSignUpHandler): Promise<string> {
  const isValid = context.isValid(['email', 'password', 'firstName', 'lastName']);
  const [email, password, firstName, lastName] = context.getManyValues(['email', 'password', 'firstName', 'lastName']);

  if (isValid && email && password && firstName && lastName) {
    const { error, jwt } = await onSignUp({ email, firstName, lastName, password });
    if (error) {
      throw error;
    }

    return jwt ?? '';
  } else {
    throw 'Some fields are not valid';
  }
}
