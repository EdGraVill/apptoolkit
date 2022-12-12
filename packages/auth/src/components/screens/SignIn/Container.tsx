import { onSignIn } from '@handlers';
import type { FC } from 'react';
import { useEffect } from 'react';

import SignIn from './SignIn';

const Container: FC = () => {
  useEffect(() => {
    return () => {
      onSignIn.controller.abort();
    };
  }, []);

  return <SignIn onSignIn={onSignIn} />;
};

export default Container;
