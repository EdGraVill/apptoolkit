import type { ConfigureAPIResponse } from '@api/configure';
import type { Configure2FA } from '@controllers/configure';

let controller = new AbortController();

async function onConfigure(configure: Configure2FA): Promise<ConfigureAPIResponse> {
  controller = new AbortController();

  const request = await fetch('/api/configure', {
    body: JSON.stringify(configure),
    method: 'POST',
    signal: controller.signal,
  });
  const response = await request.json();

  return response;
}

export default Object.assign(onConfigure, { controller });
