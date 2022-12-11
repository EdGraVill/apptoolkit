import type { ChangeEvent, FocusEvent, ReactElement } from 'react';
import { useEffect } from 'react';
import { useCallback, useState } from 'react';

import type { Context } from './context';
import { useContext } from './context';
import { Event, addEventListener } from './events';
import type { Feedback } from './validation';

export type HTMLInputLikeElement = HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLTextAreaElement;

export interface WithoutNameInjectedInputProps {
  formContext: Context;
}

export interface InjectedInputProps extends WithoutNameInjectedInputProps {
  feedback: Feedback[];
  isDirty: boolean;
  onBlur(event: FocusEvent<HTMLInputLikeElement>): void;
  onChange(event: ChangeEvent<HTMLInputLikeElement>): void;
  value: string;
}

interface PropsWithoutName {
  children(injectionProps: WithoutNameInjectedInputProps): ReactElement;
  name?: never;
}

interface PropsWithName {
  children(injectionProps: InjectedInputProps): ReactElement;
  name: string;
}

export function HTMLInputWrapper(props: PropsWithoutName): ReturnType<PropsWithoutName['children']>;
export function HTMLInputWrapper(props: PropsWithName): ReturnType<PropsWithName['children']>;
export function HTMLInputWrapper({ children, name }: PropsWithoutName | PropsWithName) {
  const formContext = useContext();
  const [isDirty, setDirtyState] = useState(false);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputLikeElement>) => {
      const value = event.currentTarget.value;

      formContext.setValue(name || '', value);
    },
    [name],
  );

  useEffect(() => {
    const removeListener = addEventListener(Event.validate, (payload) => {
      if (payload.name === name) {
        setDirtyState(true);
      }
    });

    return removeListener;
  }, []);

  useEffect(() => {
    const removeListener = addEventListener(Event.reset, (payload) => {
      if (payload.name === name) {
        setDirtyState(false);
      }
    });

    return removeListener;
  }, []);

  useEffect(() => {
    const removeListener = addEventListener(Event.resetAll, (payload) => {
      if (name && payload.names.includes(name)) {
        setDirtyState(false);
      }
    });

    return removeListener;
  }, []);

  const onBlur = useCallback(() => {
    setDirtyState(true);
  }, []);

  const propsWithoutNameToInject = {
    formContext,
  };

  if (!name) {
    return (children as PropsWithoutName['children'])(propsWithoutNameToInject);
  }

  const propsToInject = {
    ...propsWithoutNameToInject,
    feedback: formContext.state[name]?.feedback || [],
    isDirty,
    onBlur,
    onChange,
    value: formContext.state[name]?.value ?? '',
  };

  return children(propsToInject);
}

export function mergeEventHandlers<F extends (...args: Parameters<F>) => void>(
  base: F,
  ...handlers: Array<F | undefined>
): (...args: Parameters<F>) => void {
  return (...args: Parameters<F>) => {
    [base, ...handlers].forEach((handler) => handler?.(...args));
  };
}
