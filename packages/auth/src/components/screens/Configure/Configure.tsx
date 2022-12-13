import type { generate2FASecret } from '@apptoolkit/2fa';
import type { Context } from '@apptoolkit/form';

import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { onConfigure } from '@handlers';
import { useFleetingState, useSteper } from '@hooks';

import ShowQR from './ShowQR';
import Verify from './Verify';
import onSubmitHandler from './onSubmitHandler';

interface Props extends Omit<Record<keyof ReturnType<typeof generate2FASecret>, string>, 'bin'> {
  onConfigure: typeof onConfigure;
}

export const Configure: FC<Props> = ({ onConfigure, qr, secret, uri }) => {
  const { refresh } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { nextStep, previousStep, step } = useSteper(2);
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useFleetingState<string>(3_000);

  useEffect(() => {
    if (ref.current) {
      const w = ref.current.parentElement?.getBoundingClientRect().width ?? 0;

      ref.current.style.transform = `translateX(-${step * w}px)`;
    }
  }, [step]);

  const onSubmit = useCallback(
    async (context: Context) => {
      console.log({ context });
      setLoadingState(true);

      try {
        await onSubmitHandler(context, secret, onConfigure);

        refresh();
      } catch (error) {
        if (typeof error === 'string') {
          setError(error);
        }
      } finally {
        setLoadingState(false);
      }
    },
    [secret],
  );

  return (
    <main className="transform-gpu transition-transform" ref={ref} style={{ width: `${2 * 100}%` }}>
      <div className="grid w-full grid-cols-2 grid-rows-1">
        <ShowQR onNext={nextStep} qr={qr} uri={uri} />
        <Verify error={error} isLoading={isLoading} onCancel={previousStep} onSubmit={onSubmit} />
      </div>
    </main>
  );
};

export default Configure;
