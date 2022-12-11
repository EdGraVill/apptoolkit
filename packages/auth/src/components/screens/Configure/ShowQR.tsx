'use client';

import { Button } from '@apptoolkit/ui/dist/input';

import { useSteper } from '@hooks';
import Image from 'next/image';
import Link from 'next/link';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FullCard } from '@components/surfaces';

import URI from './URI';

const ShowQR: FC<Record<'qr' | 'secret' | 'uri', string>> = ({ qr, secret, uri }) => {
  const controller = useRef(new AbortController());
  const { nextStep, previousStep, step } = useSteper(2);
  const [code, setCode] = useState('');
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  console.log(secret);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === '' || event.currentTarget.value.match(/^[0-9]{1,6}$/)) {
      setCode(event.currentTarget.value);
    }
  }, []);

  useEffect(() => {
    return () => {
      controller.current.abort();
    };
  }, []);

  const onSendCode = async () => {
    setLoadingState(true);
    controller.current = new AbortController();

    try {
      const request = await fetch('/api/configure', {
        body: JSON.stringify({ code, secret }),
        method: 'POST',
        signal: controller.current.signal,
      });
      const response = await request.json();

      setError(response?.jwt);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <FullCard className="overflow-hidden px-0">
      <h1 className="text-center font-sans text-xl font-semibold">Configure 2FA</h1>
      <div
        className={`w-full ${
          step === 0 ? 'translate-x-0' : '-translate-x-full'
        } relative my-10 px-10 transition-transform`}
      >
        <p className="font-sans text-sm">
          To proceed, use your Authenticator app to register a new account and scan this QR code
        </p>
        <Image alt="QR Code with 2FA secret" className="mx-auto my-5" height={166} src={qr.toString()} width={166} />
        <fieldset className="mx-auto my-5 w-1/2 border-t border-gray-400">
          <legend className="px-4 text-center font-mono text-xs text-gray-500">OR</legend>
        </fieldset>
        <p className="text-center font-sans text-sm">Open this link in your device</p>
        <URI uri={uri.toString()} />
        <div className="absolute top-0 bottom-0 right-0 left-0 flex translate-x-full flex-col items-center justify-center px-10">
          <p className="text-center font-sans">Now confirm that everything is ok by typing the code:</p>
          <input
            className="my-10 w-52 rounded-xl border border-slate-400 px-6 py-3 text-center text-4xl tracking-widest focus:outline-none"
            onChange={onChange}
            value={code}
          />
          {error && <p className="text-center text-rose-400">{error}</p>}
        </div>
      </div>
      <div className="flex flex-row-reverse justify-between px-10">
        {step === 0 ? (
          <Button
            className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-600"
            onClick={nextStep}
          >
            Continue
          </Button>
        ) : (
          <Button
            className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-600"
            isDisabled={isLoading}
            isLoading={isLoading}
            onClick={onSendCode}
          >
            Confirm
          </Button>
        )}
        {step === 0 ? (
          <Link href="/">
            <Button className="border-0 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700">
              Cancel
            </Button>
          </Link>
        ) : (
          <Button
            className="border-0 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            onClick={previousStep}
          >
            Back
          </Button>
        )}
      </div>
    </FullCard>
  );
};

export default ShowQR;
