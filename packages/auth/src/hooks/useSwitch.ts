import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

export default function useSwitch(
  initialState?: boolean | (() => boolean),
): [state: boolean, switchState: () => void, overrideState: Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState(initialState ?? false);

  const switchState = useCallback(() => {
    setState((previousState) => !previousState);
  }, []);

  return [state, switchState, setState];
}
