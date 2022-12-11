'use client';

import { Button } from '@apptoolkit/ui/dist/input';

import Link from 'next/link';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FullCard } from '@components/surfaces';

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
    <FullCard className="overflow-hidden px-0">
      <h1 className="text-center font-sans text-xl font-semibold">Verify Account</h1>
      <div className="my-10 w-full px-10">
        <p className="text-center font-sans">Type your code:</p>
        <input
          className="mx-auto my-10 block w-52 rounded-xl border border-slate-400 px-6 py-3 text-center text-4xl tracking-widest focus:outline-none"
          onChange={onChange}
          value={code}
        />
        {error && <p className="text-center text-rose-400">{error}</p>}
      </div>
      <div className="flex flex-row-reverse justify-between px-10">
        <Button
          className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-600"
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={onSendCode}
        >
          Confirm
        </Button>
        <Link href="/">
          <Button className="border-0 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700">
            Cancel
          </Button>
        </Link>
      </div>
    </FullCard>
  );
};

export default Verify;
