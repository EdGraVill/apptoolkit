import type { ChangeEvent, FocusEvent, ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

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
  format?:
    | {
        formater(value: string): string;
        parser?(formated: string): string;
      }
    | undefined;
  name?: never;
}

interface PropsWithName {
  children(injectionProps: InjectedInputProps): ReactElement;
  format?:
    | {
        formater(value: string): string;
        parser?(formated: string): string;
      }
    | undefined;
  name: string;
}

export function HTMLInputWrapper(props: PropsWithoutName): ReturnType<PropsWithoutName['children']>;
export function HTMLInputWrapper(props: PropsWithName): ReturnType<PropsWithName['children']>;
export function HTMLInputWrapper({ children, format, name }: PropsWithoutName | PropsWithName) {
  const formContext = useContext();
  const [isDirty, setDirtyState] = useState(false);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputLikeElement>) => {
      const value = event.currentTarget.value;

      formContext.setValue(name || '', format?.parser?.(format?.formater(value) ?? value) ?? value);
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

  const value = formContext.state[name]?.value ?? '';

  const propsToInject = {
    ...propsWithoutNameToInject,
    feedback: formContext.state[name]?.feedback || [],
    isDirty,
    onBlur,
    onChange,
    value: format?.formater ? format.formater(value) : value,
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
