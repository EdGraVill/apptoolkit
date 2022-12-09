/* eslint-disable prettier/prettier */
'use client';
import URI from './URI';
import { Button } from '@apptoolkit/ui/dist/input';
import { FullCard } from '@components/surfaces';
import { useSteper } from '@hooks';
import Image from 'next/image';
import Link from 'next/link';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useCallback, useState, useRef } from 'react';

const ShowQR: FC<Record<'qr' | 'secret' | 'uri', string>> = ({ qr, secret, uri }) => {
  const controller = useRef(new AbortController());
  const { nextStep, previousStep, step } = useSteper(2);
  const [code, setCode] = useState('');
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

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
    <FullCard className="px-0 overflow-hidden">
      <h1 className="text-xl text-center font-semibold font-sans">Configure 2FA</h1>
      <div
        className={`w-full ${
          step === 0 ? 'translate-x-0' : '-translate-x-full'
        } px-10 transition-transform relative my-10`}
      >
        <p className="font-sans text-sm">
          To proceed, use your Authenticator app to register a new account and scan this QR code
        </p>
        <Image alt="QR Code with 2FA secret" className="mx-auto my-5" height={166} src={qr.toString()} width={166} />
        <fieldset className="border-t border-gray-400 w-1/2 mx-auto my-5">
          <legend className="text-center px-4 text-xs font-mono text-gray-500">OR</legend>
        </fieldset>
        <p className="text-center font-sans text-sm">Open this link in your device</p>
        <URI uri={uri.toString()} />
        <div className="absolute top-0 bottom-0 right-0 left-0 translate-x-full px-10 flex flex-col justify-center items-center">
          <p className="font-sans text-center">Now confirm that everything is ok by typing the code:</p>
          <input
            className="border border-slate-400 text-4xl px-6 py-3 rounded-xl focus:outline-none my-10 text-center w-52 tracking-widest"
            onChange={onChange}
            value={code}
          />
          {error && <p className="text-rose-400 text-center">{error}</p>}
        </div>
      </div>
      <div className="flex flex-row-reverse justify-between px-10">
        {step === 0 ? (
          <Button
            className="border-0 bg-violet-500 text-white hover:bg-violet-600 transition-colors"
            onClick={nextStep}
          >
            Continue
          </Button>
        ) : (
          <Button
            className="border-0 bg-violet-500 text-white hover:bg-violet-600 transition-colors"
            isDisabled={isLoading}
            isLoading={isLoading}
            onClick={onSendCode}
          >
            Confirm
          </Button>
        )}
        {step === 0 ? (
          <Link href="/">
            <Button className="border-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
              Cancel
            </Button>
          </Link>
        ) : (
          <Button
            className="border-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
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
