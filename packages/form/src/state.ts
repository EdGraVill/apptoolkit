import type { Feedback, ValidatorFunction } from './validation';
import { validate } from './validation';

export type Values = Record<string, string>;

export function compareValues(original: Values, replace: Values, sideFunction?: (isTheSame: boolean) => void): Values {
  if (original === replace) {
    sideFunction?.(true);
    return original;
  }

  const keys = Object.keys(original);

  if (keys.length !== Object.keys(replace).length) {
    sideFunction?.(false);
    return replace;
  }

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];

    if (original[key] !== replace[key]) {
      sideFunction?.(false);
      return replace;
    }
  }

  sideFunction?.(true);
  return original;
}

export function valuesFromInputDefinitions(inputDefinitions: InputDefinition[], previousValues?: Values): Values {
  return inputDefinitions.reduce((acc, curr) => {
    let value = curr.initialValue || '';

    const previousValue = previousValues?.[curr.name];
    if (typeof previousValue === 'string' && previousValue !== value) {
      value = previousValue;
    }

    return {
      ...acc,
      [curr.name]: value,
    };
  }, {});
}

export interface InputDefinition {
  initialValue?: string;
  name: string;
  validators?: ValidatorFunction[];
}

export interface InputState extends InputDefinition {
  feedback: Feedback[];
  value: string;
}

export type State = Record<string, InputState>;

export function composeState(inputDefinitions: InputDefinition[], values: Values): State {
  return Object.keys(values).reduce<Record<string, InputState>>((acc, curr) => {
    const inputDefinition: InputDefinition | undefined = inputDefinitions.find(({ name }) => name === curr);

    return {
      ...acc,
      [curr]: {
        feedback: validate(values[curr], inputDefinition?.validators),
        initialValue: inputDefinition?.initialValue,
        name: curr,
        validators: inputDefinition?.validators,
        value: values[curr],
      },
    };
  }, {});
}
