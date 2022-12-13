import type { generate2FASecret } from '@apptoolkit/2fa';

import type { FC } from 'react';
import { useEffect } from 'react';

import { onConfigure } from '@handlers';

import Configure from './Configure';

const Container: FC<Omit<Record<keyof ReturnType<typeof generate2FASecret>, string>, 'bin'>> = ({
  qr,
  secret,
  uri,
}) => {
  useEffect(() => {
    return () => {
      onConfigure.controller.abort();
    };
  }, []);

  return <Configure onConfigure={onConfigure} qr={qr} secret={secret} uri={uri} />;
};

export default Container;
