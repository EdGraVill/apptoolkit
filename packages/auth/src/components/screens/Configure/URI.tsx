/* eslint-disable prettier/prettier */
'use client';
import type { FC, FocusEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';

interface Props {
  uri: string;
}

const URI: FC<Props> = ({ uri }) => {
  const [isCopied, setCopiedState] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setCopiedState(false), 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied]);

  const onFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.setSelectionRange(0, event.currentTarget.value.length);
    navigator.clipboard.writeText(event.currentTarget.value);
    setCopiedState(true);
  }, []);

  return (
    <label className="block relative mx-auto w-4/5 my-3">
      <input
        className="bg-transparent border border-slate-400 text-xs font-mono rounded-md px-3 py-2 pr-9 selection:bg-purple-300 w-full focus:border-purple-800 focus:outline-none"
        onFocus={onFocus}
        readOnly={true}
        type="text"
        value={uri}
      />
      <svg
        className="absolute right-3 top-2 w-4 cursor-pointer"
        clipRule="evenodd"
        fillRule="evenodd"
        imageRendering="optimizeQuality"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        viewBox="0 0 438 511.52"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M141.44 0h172.68c4.71 0 8.91 2.27 11.54 5.77L434.11 123.1a14.37 14.37 0 0 1 3.81 9.75l.08 251.18c0 17.62-7.25 33.69-18.9 45.36l-.07.07c-11.67 11.64-27.73 18.87-45.33 18.87h-20.06c-.3 17.24-7.48 32.9-18.88 44.29-11.66 11.66-27.75 18.9-45.42 18.9H64.3c-17.67 0-33.76-7.24-45.41-18.9C7.24 480.98 0 464.9 0 447.22V135.87c0-17.68 7.23-33.78 18.88-45.42C30.52 78.8 46.62 71.57 64.3 71.57h12.84V64.3c0-17.68 7.23-33.78 18.88-45.42C107.66 7.23 123.76 0 141.44 0zm30.53 250.96c-7.97 0-14.43-6.47-14.43-14.44 0-7.96 6.46-14.43 14.43-14.43h171.2c7.97 0 14.44 6.47 14.44 14.43 0 7.97-6.47 14.44-14.44 14.44h-171.2zm0 76.86c-7.97 0-14.43-6.46-14.43-14.43 0-7.96 6.46-14.43 14.43-14.43h136.42c7.97 0 14.43 6.47 14.43 14.43 0 7.97-6.46 14.43-14.43 14.43H171.97zM322.31 44.44v49.03c.96 12.3 5.21 21.9 12.65 28.26 7.8 6.66 19.58 10.41 35.23 10.69l33.39-.04-81.27-87.94zm86.83 116.78-39.17-.06c-22.79-.35-40.77-6.5-53.72-17.57-13.48-11.54-21.1-27.86-22.66-48.03l-.14-2v-64.7H141.44c-9.73 0-18.61 4-25.03 10.41C110 45.69 106 54.57 106 64.3v319.73c0 9.74 4.01 18.61 10.42 25.02 6.42 6.42 15.29 10.42 25.02 10.42H373.7c9.75 0 18.62-3.98 25.01-10.38 6.45-6.44 10.43-15.3 10.43-25.06V161.22zm-84.38 287.11H141.44c-17.68 0-33.77-7.24-45.41-18.88-11.65-11.65-18.89-27.73-18.89-45.42v-283.6H64.3c-9.74 0-18.61 4-25.03 10.41-6.41 6.42-10.41 15.29-10.41 25.03v311.35c0 9.73 4.01 18.59 10.42 25.01 6.43 6.43 15.3 10.43 25.02 10.43h225.04c9.72 0 18.59-4 25.02-10.43 6.17-6.17 10.12-14.61 10.4-23.9z" />
      </svg>
      <p className={`absolute text-xs text-right w-full ${isCopied ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        Copied
      </p>
    </label>
  );
};

export default URI;
