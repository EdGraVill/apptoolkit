import type { DependencyList, EffectCallback } from 'react';
import { useEffect } from 'react';

export default function useDelayedEffect(delayInMs: number, effectCallback: EffectCallback, deps?: DependencyList) {
  useEffect(() => {
    let cleaner: ReturnType<EffectCallback> | undefined;

    const timeout = setTimeout(() => {
      cleaner = effectCallback();
    }, delayInMs);

    return () => {
      clearTimeout(timeout);
      cleaner?.();
    };
  }, deps);
}
