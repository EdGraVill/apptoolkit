import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import useDelayedEffect from './useDelayedEffect';

export default function useFleetingState<T>(
  timeInMs: number,
  initialState?: T | (() => T),
): [state: T | undefined, setState: Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialState);

  useDelayedEffect(timeInMs, () => setState(undefined), [state]);

  return [state, setState as Dispatch<SetStateAction<T>>];
}
