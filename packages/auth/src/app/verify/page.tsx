import { Verify } from '@components/screens';
import useJWT from '@hooks/server/useJWT';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams?: {
    jwt?: string;
  };
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const jwt = await useJWT(searchParams?.jwt);

  if (!jwt) {
    return redirect('/');
  }

  if (!jwt.is2FAEnabled) {
    return redirect('/configure');
  }

  return <Verify />;
}
