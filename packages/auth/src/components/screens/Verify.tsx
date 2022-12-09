/* eslint-disable prettier/prettier */
'use client';
import { Button } from '@apptoolkit/ui/dist/input';
import { FullCard } from '@components/surfaces';
import Link from 'next/link';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useCallback, useState, useRef } from 'react';

const Verify: FC = () => {
  const controller = useRef(new AbortController());
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
      const request = await fetch('/api/verify', {
        body: JSON.stringify({ code }),
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
      <h1 className="text-xl text-center font-semibold font-sans">Verify Account</h1>
      <div className="w-full px-10 my-10">
        <p className="font-sans text-center">Type your code:</p>
        <input
          className="block mx-auto border border-slate-400 text-4xl px-6 py-3 rounded-xl focus:outline-none my-10 text-center w-52 tracking-widest"
          onChange={onChange}
          value={code}
        />
        {error && <p className="text-rose-400 text-center">{error}</p>}
      </div>
      <div className="flex flex-row-reverse justify-between px-10">
        <Button
          className="border-0 bg-violet-500 text-white hover:bg-violet-600 transition-colors"
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={onSendCode}
        >
          Confirm
        </Button>
        <Link href="/">
          <Button className="border-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
            Cancel
          </Button>
        </Link>
      </div>
    </FullCard>
  );
};

export default Verify;
