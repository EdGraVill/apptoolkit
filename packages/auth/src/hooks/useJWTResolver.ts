import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function useJWTResolver(): (jwt: string) => void {
  const { push } = useRouter();

  const resolve = useCallback(
    (jwt: string) => {
      const url = new URL(process.env.ON_SIGN_IN_URL ?? 'http://localhost:3000/test');
      url.searchParams.set('jwt', jwt);

      push(url.toString());
    },
    [push],
  );

  return resolve;
}
