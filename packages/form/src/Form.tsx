import { Context } from './context';
import { dispatchEvent, Event } from './events';
import type { InputDefinition, InputState } from './state';
import { compareValues, composeState, valuesFromInputDefinitions } from './state';
import type { Signal } from './useSignal';
import type { Feedback } from './validation';
import { Severity } from './validation';
import type { FC, ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface Props {
  children?: ReactElement | ReactElement[];
  inputDefinitions?: InputDefinition[];
  onSubmit?(context: Context): void;
  signal?: Signal;
}

const Form: FC<Props> = ({ children, inputDefinitions = [], onSubmit, signal }) => {
  const [values, setInternalValues] = useState(valuesFromInputDefinitions(inputDefinitions));

  useEffect(() => {
    setInternalValues((previousValues) =>
      compareValues(previousValues, valuesFromInputDefinitions(inputDefinitions, previousValues), (isTheSame) => {
        if (!isTheSame) {
          dispatchEvent(Event.inputDefinitionsUpdate, inputDefinitions);
        }
      }),
    );
  }, [inputDefinitions]);

  const setValue = useCallback(
    (name: string, newValue: string | undefined, internalEvent: Event.clear | Event.reset | Event.set = Event.set) => {
      setInternalValues((previousValues) => {
        if (typeof previousValues[name] === 'undefined') {
          return previousValues;
        }

        const newValues = { ...previousValues };
        Reflect.set(newValues, name, newValue ?? '');

        return compareValues(previousValues, newValues, (isTheSame) => {
          if (!isTheSame) {
            dispatchEvent(internalEvent, internalEvent === Event.set ? { name, value: newValue ?? '' } : { name });
          }
        });
      });
    },
    [],
  );

  const setManyValues = useCallback(
    (
      names: string[],
      newValues: Array<string | undefined> | string | undefined,
      internalEvent: Event.clearAll | Event.resetAll | Event.setMany = Event.setMany,
    ) => {
      setInternalValues((previousValues) => {
        const cloneValues = { ...previousValues };
        names.forEach((name, ix) => {
          if (typeof cloneValues[name] === 'string') {
            Reflect.set(cloneValues, name, (newValues instanceof Array ? newValues[ix] : newValues) ?? '');
          }
        });

        return compareValues(previousValues, cloneValues, (isTheSame) => {
          if (!isTheSame) {
            dispatchEvent(
              internalEvent,
              internalEvent === Event.clearAll ? { names } : { names, values: names.map((name) => cloneValues[name]) },
            );
          }
        });
      });
    },
    [],
  );

  const state = composeState(inputDefinitions, values);

  const getValue = (name: string) => {
    if (typeof values[name] === 'string') {
      dispatchEvent(Event.get, state[name]);

      return values[name];
    }
  };

  const getManyValues = (names: string[]) => {
    const states: Array<InputState | undefined> = names.map((name) => state[name]);

    dispatchEvent(Event.getMany, states);

    return states.map((s) => s?.value);
  };

  const clearValue = useCallback((name: string) => {
    setValue(name, '', Event.clear);
  }, []);

  const clearAllValues = useCallback(() => {
    setManyValues(
      inputDefinitions.map(({ name }) => name),
      '',
      Event.clearAll,
    );
  }, [inputDefinitions]);

  const resetValue = useCallback(
    (name: string) => {
      const toReset = inputDefinitions.find((def) => def.name === name);

      if (toReset) {
        setValue(name, toReset.initialValue, Event.reset);
      }
    },
    [inputDefinitions],
  );

  const resetAllValues = useCallback(() => {
    const names: string[] = [];
    const initialValues: Array<string | undefined> = [];

    inputDefinitions.forEach(({ name, initialValue }) => {
      names.push(name);
      initialValues.push(initialValue);
    });

    setManyValues(names, initialValues, Event.resetAll);
  }, [inputDefinitions]);

  const isValid = (name: string | string[]): boolean => {
    if (typeof name === 'string' && typeof state[name] !== 'undefined') {
      const result =
        state[name].feedback?.reduce<boolean>(
          (acc, curr) => Boolean(Number(acc) * Number(curr.severity !== Severity.error)),
          true,
        ) ?? true;

      dispatchEvent(Event.validate, {
        feedback: state[name].feedback ?? [],
        name,
        result,
      });

      return result;
    }

    if (name instanceof Array) {
      return name.map((n) => isValid(n)).reduce((acc, curr) => Boolean(Number(acc) * Number(curr)), true);
    }

    return false;
  };

  const getFeedback = (name: string): Feedback[] => state[name]?.feedback ?? [];

  const formContext = {
    clearAllValues,
    clearValue,
    getFeedback,
    getManyValues,
    getValue,
    isValid,
    resetAllValues,
    resetValue,
    setManyValues,
    setValue,
    state,
    submit() {
      dispatchEvent(Event.submit, formContext);
      onSubmit?.(formContext);
    },
  };

  useEffect(() => {
    if (signal) {
      signal.sync(formContext);
    }
  }, [setValue, formContext]);

  return <Context.Provider value={formContext}>{children}</Context.Provider>;
};

export default Form;
