import type { Context } from './context';
import { defaultContextValue } from './context';
import { useMemo, useRef } from 'react';

export type Signal = symbol & {
  sync(formContext: Context): void;
};

export default function useFormSignal(): Context & { signal: Signal } {
  const formContext = useRef<Context>(defaultContextValue);

  const signal = useMemo<Signal>(
    () =>
      Object.assign(Symbol('formSignal'), {
        sync(fc: Context) {
          formContext.current = fc;
        },
        toString() {
          return 'formSignal';
        },
      }),
    [],
  );

  return {
    ...formContext.current,
    signal,
  };
}
