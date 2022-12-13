import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function useJWTResolver(): (jwt: string) => void {
  const { push } = useRouter();

  const resolve = useCallback(
    (jwt: string) => {
      console.log(process.env.NEXT_PUBLIC_ON_SIGN_IN_URL);
      const url = new URL(process.env.NEXT_PUBLIC_ON_SIGN_IN_URL ?? 'http://localhost:3000/test');
      url.searchParams.set('jwt', jwt);

      push(url.toString());
    },
    [push],
  );

  return resolve;
}
