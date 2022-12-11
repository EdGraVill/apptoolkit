import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function TestPage() {
  const { get } = useSearchParams();
  const [overed, setHovered] = useState<'head' | 'payload' | undefined>(undefined);

  const onPointerEvent = useCallback(
    (target: 'head' | 'payload', hover: 'in' | 'out') => () => {
      setHovered(hover === 'out' ? undefined : target);
    },
    [],
  );

  const [head, payload, sign] = get('jwt')?.split('.') ?? ['', '', ''];
  const [headP, payloadP] = [head, payload].map((data) => Buffer.from(data, 'base64').toString());

  return (
    <div className="relative flex h-screen w-screen items-center justify-center">
      <p className="text-md relative mx-auto max-w-xl break-all font-mono font-semibold tracking-widest text-zinc-600">
        <p className="absolute">
          <span
            className={overed === 'head' ? 'text-rose-500' : 'text-transparent'}
            onMouseOut={onPointerEvent('head', 'out')}
            onMouseOver={onPointerEvent('head', 'in')}
          >
            {headP}
            <span className="select-none text-transparent">
              {'0'.repeat(Math.ceil(Math.abs(head.length - headP.length)) + 1)}
            </span>
          </span>
          <span
            className={overed === 'payload' ? 'text-violet-500' : 'text-transparent'}
            onMouseOut={onPointerEvent('payload', 'out')}
            onMouseOver={onPointerEvent('payload', 'in')}
          >
            {payloadP}
            <span className="select-none text-transparent">
              {'0'.repeat(Math.ceil(Math.abs(payload.length - payloadP.length)) + 1)}
            </span>
          </span>
        </p>
        <span className={overed === 'head' ? 'text-rose-200' : 'text-rose-500'}>{head}</span>
        <span>.</span>
        <span className={overed === 'payload' ? 'text-violet-200' : 'text-violet-500'}>{payload}</span>
        <span>.</span>
        <span className="text-sky-400 hover:text-sky-400">{sign}</span>
      </p>
    </div>
  );
}
