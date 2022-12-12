import { Button } from '@apptoolkit/ui/dist/input';

import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { LayoutTitle } from '@components/layout/Loader';

import URI from './URI';

interface Props {
  onNext(): void;
  qr: string;
  uri: string;
}

const ShowQR: FC<Props> = ({ onNext, qr, uri }) => {
  const [isLoading, setLoadingState] = useState(true);

  const onLoaded = useCallback(() => setLoadingState(false), []);

  return (
    <div className="w-full">
      <LayoutTitle>Configure 2FA</LayoutTitle>
      <p className="px-14 text-center font-sans text-sm">
        To start, use your Authenticator app to register a new account and scan this QR code
      </p>
      <Image
        alt="QR Code with 2FA secret"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
        className="mx-auto my-5"
        height={166}
        onLoadingComplete={onLoaded}
        placeholder="blur"
        src={qr.toString()}
        width={166}
      />
      <fieldset className="mx-auto my-5 w-1/2 border-t border-gray-400">
        <legend className="px-4 text-center font-mono text-xs text-gray-500">OR</legend>
      </fieldset>
      <p className="text-center font-sans text-sm">Open this link in your device</p>
      <URI uri={uri.toString()} />
      <div className="my-10 flex flex-row-reverse justify-between px-14">
        <Button
          className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-600"
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={onNext}
        >
          Continue
        </Button>
        <Link href="/">
          <Button className="border-0 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ShowQR;
