import type { SignInApiResponse } from '@api/signin';
import type { Credentials } from '@controllers/signIn';

let controller = new AbortController();

async function onSignIn(credentials: Credentials): Promise<SignInApiResponse> {
  controller = new AbortController();

  const request = await fetch('/api/signin', {
    body: JSON.stringify(credentials),
    method: 'POST',
    signal: controller.signal,
  });
  const response = await request.json();

  return response;
}

export default Object.assign(onSignIn, { controller });
