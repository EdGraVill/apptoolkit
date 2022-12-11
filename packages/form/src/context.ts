import { createContext, useContext as useReactContext } from 'react';

import type { InputState } from './state';
import type { Feedback } from './validation';

export interface Context {
  clearAllValues(): void;
  clearValue(name: string): void;
  getFeedback(name: string): Feedback[];
  getManyValues(names: string[]): Array<string | undefined>;
  getValue(name: string): string | undefined;
  isValid(name: string | string[]): boolean;
  resetAllValues(): void;
  resetValue(name: string): void;
  setManyValues(names: string[], values: string[]): void;
  setValue(name: string, value: string): void;
  state: Record<string, InputState>;
  submit(): void;
}

export const defaultContextValue: Context = {
  clearAllValues() {
    return;
  },
  clearValue() {
    return;
  },
  getFeedback() {
    return [];
  },
  getManyValues() {
    return [];
  },
  getValue() {
    return undefined;
  },
  isValid() {
    return false;
  },
  resetAllValues() {
    return;
  },
  resetValue() {
    return;
  },
  setManyValues() {
    return;
  },
  setValue() {
    return;
  },
  state: {},
  submit() {
    return;
  },
};

export const Context = createContext<Context>(defaultContextValue);

export const useContext = () => useReactContext(Context);
