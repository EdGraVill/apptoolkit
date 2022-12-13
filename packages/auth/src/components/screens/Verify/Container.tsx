import type { FC } from 'react';
import { useEffect } from 'react';

import { onVerify } from '@handlers';

import Verify from './Verify';

const Container: FC = () => {
  useEffect(() => {
    return () => {
      onVerify.controller.abort();
    };
  }, []);

  return <Verify onVerify={onVerify} />;
};

export default Container;
