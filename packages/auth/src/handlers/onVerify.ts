import type { VerifyApiResponse } from '@api/verify';

let controller = new AbortController();

async function onVerify(code: string): Promise<VerifyApiResponse> {
  controller = new AbortController();

  const request = await fetch('/api/verify', {
    body: JSON.stringify({ code }),
    method: 'POST',
    signal: controller.signal,
  });
  const response = await request.json();

  return response;
}

export default Object.assign(onVerify, { controller });
