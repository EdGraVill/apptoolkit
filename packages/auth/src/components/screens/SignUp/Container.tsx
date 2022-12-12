import { onSignUp } from '@handlers';
import type { FC } from 'react';
import { useEffect } from 'react';

import SignUp from './SignUp';

const Container: FC = () => {
  useEffect(() => {
    return () => {
      onSignUp.controller.abort();
    };
  }, []);

  return <SignUp onSignUp={onSignUp} />;
};

export default Container;
