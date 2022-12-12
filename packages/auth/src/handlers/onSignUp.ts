import type { SignUpApiResponse } from '@api/signup';
import type { NewAccount } from '@controllers/signUp';

let controller = new AbortController();

async function onSignUp(credentials: NewAccount): Promise<SignUpApiResponse> {
  controller = new AbortController();

  const request = await fetch('/api/signup', {
    body: JSON.stringify(credentials),
    method: 'POST',
    signal: controller.signal,
  });
  const response = await request.json();

  return response;
}

export default Object.assign(onSignUp, { controller });
