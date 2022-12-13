import { deleteCookie, removeCookies } from 'cookies-next';
import type { GetServerSideProps } from 'next';

export default function SignOut() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  deleteCookie('jwt', { req, res });
  removeCookies('jwt', { req, res });

  return {
    props: {},
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};
