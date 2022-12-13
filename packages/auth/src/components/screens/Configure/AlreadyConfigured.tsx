import cn from 'classnames';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { LayoutTitle } from '@components/layout/Loader';
import { useJWTResolver } from '@hooks';

interface Props {
  jwt: string;
}

const AlreadyConfigured: FC<Props> = ({ jwt }) => {
  const resolver = useJWTResolver();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (!(previousTime - 1)) {
          clearInterval(interval);
        }

        return previousTime - 1;
      });
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (timeLeft === 0) {
    resolver(jwt);
  }

  return (
    <>
      <LayoutTitle success="This account already has been configured a 2FA method">Configured</LayoutTitle>
      <p className="m-14 text-center font-sans text-xl font-semibold">
        Will be redirected in{' '}
        <span
          className={cn('transition-colors', {
            ['text-primary-100']: timeLeft === 1,
            ['text-primary-300']: timeLeft === 2,
            ['text-primary-50']: timeLeft === 0,
            ['text-primary-500']: timeLeft === 3,
            ['text-primary-700']: timeLeft === 4,
            ['text-primary-900']: timeLeft === 5,
          })}
        >
          {timeLeft}
        </span>{' '}
        seconds
      </p>
    </>
  );
};

export default AlreadyConfigured;
