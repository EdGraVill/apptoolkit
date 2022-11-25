import Form from './Form';
import { HTMLInputWrapper } from './HTMLInputWrapper';
import type { Context } from './context';
import { useContext } from './context';
import { addEventListener, clearAllListeners, Event } from './events';
import type { InputDefinition, InputState } from './state';
import { commonValidators, validate } from './validation';
import { act, render } from '@testing-library/react';
import React from 'react';

const inputDefinitions: InputDefinition[] = [
  { initialValue: 'mail@test.io', name: 'email', validators: [commonValidators.isEmailBuilder('Invalid email')] },
  { name: 'password', validators: [commonValidators.isRequiredBuilder('Password required')] },
];
function definitionToInitialState({ name, initialValue = '', validators }: InputDefinition): InputState {
  return {
    feedback: validate(initialValue, validators),
    initialValue: initialValue || undefined,
    name,
    validators: validators,
    value: initialValue ?? '',
  };
}
const initialState: Record<string, InputState> = inputDefinitions.reduce(
  (acc, curr) => ({
    ...acc,
    [curr.name]: definitionToInitialState(curr),
  }),
  {},
);

describe('Form', () => {
  it('Should not render any html element', () => {
    const { container } = render(<Form />);

    expect(container.childElementCount).toBe(0);
  });

  it('Should only render the html elements', () => {
    const { container } = render(
      <Form>
        <HTMLInputWrapper>{() => <input />}</HTMLInputWrapper>
        <HTMLInputWrapper>{() => <input />}</HTMLInputWrapper>
      </Form>,
    );

    expect(container.childElementCount).toBe(2);
    expect(container.innerHTML).toBe('<input><input>');
  });
});

describe('formContext', () => {
  let formContext: Context | undefined;
  let renderCount = 0;
  const ContextExtractor = () => {
    formContext = useContext();
    renderCount += 1;
    return <></>;
  };

  beforeEach(() => {
    render(
      <Form inputDefinitions={inputDefinitions}>
        <ContextExtractor />
      </Form>,
    );
  });

  afterEach(() => {
    renderCount = 0;
    clearAllListeners();
  });

  it('Should return default context if is not inside Form Component', () => {
    render(<ContextExtractor />);

    expect(formContext).not.toBeUndefined();

    function testValues(value: unknown) {
      if (typeof value === 'function') {
        testValues(value());
      } else if (value instanceof Array) {
        expect(value).toHaveLength(0);
      } else if (typeof value === 'object') {
        expect(value).toEqual({});
      } else {
        expect(value).toBeFalsy();
      }
    }
    Object.values(formContext || {}).forEach(testValues);
  });

  it('Should be accesible inside Form Component', () => {
    render(
      <Form inputDefinitions={inputDefinitions}>
        <ContextExtractor />
      </Form>,
    );

    expect(formContext?.state).toEqual(initialState);
  });

  describe('formContext.setValue function', () => {
    it('Should set the value of a single input state', async () => {
      const newValue = 'mail@test.com';
      const expectedState = {
        ...initialState,
        [inputDefinitions[0].name]: {
          ...definitionToInitialState({ ...inputDefinitions[0], initialValue: newValue }),
          initialValue: inputDefinitions[0].initialValue,
        },
      };

      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, newValue);
      });

      expect(formContext?.state).toEqual(expectedState);
    });

    it('Should call event listener for Event.set', async () => {
      const newValue = 'mail@test.com';
      const listener = jest.fn();

      addEventListener(Event.set, listener);
      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, newValue);
      });

      expect(listener).toHaveBeenCalledWith({ name: inputDefinitions[0].name, value: newValue });
    });

    it('Should not re render if a input key does not exist', async () => {
      await act(() => {
        formContext?.setValue('foo', 'randomValue');
      });
      await act(() => {
        formContext?.setValue('bar', 'randomValue');
      });

      expect(formContext?.state).toEqual(initialState);
      expect(renderCount).toBe(1);
    });

    it('Should not re render if the value seted is the same as is in the state', async () => {
      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, inputDefinitions[0].initialValue || '');
      });
      await act(() => {
        formContext?.setValue(inputDefinitions[1].name, inputDefinitions[1].initialValue || '');
      });

      expect(formContext?.state).toEqual(initialState);
      expect(renderCount).toBe(1);
    });

    it('Should not call event listener for Event.set if the key does not exist or value seted is the same as is in the state', async () => {
      const listener = jest.fn();

      addEventListener(Event.set, listener);
      await act(() => {
        formContext?.setValue('foo', '');
        formContext?.setValue(inputDefinitions[0].name, inputDefinitions[0].initialValue || '');
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('formContext.getValue function', () => {
    it('Should return the current value', async () => {
      const newValue = 'randomText';

      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, newValue);
      });

      expect(formContext?.getValue(inputDefinitions[0].name)).toBe(newValue);
    });

    it('Should call event listener for Event.get', async () => {
      const listener = jest.fn();

      addEventListener(Event.get, listener);
      await act(() => {
        formContext?.getValue(inputDefinitions[0].name);
      });

      expect(listener).toHaveBeenCalledWith(initialState[inputDefinitions[0].name]);
    });

    it('Should return undefined if the key does not exist', async () => {
      expect(formContext?.getValue('foo')).toBeUndefined();
    });

    it('Should not call event listener for Event.get if the key does not exist', async () => {
      const listener = jest.fn();

      addEventListener(Event.get, listener);
      await act(() => {
        formContext?.getValue('foo');
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('formContext.getManyValues function', () => {
    it('Should return the current array of value', async () => {
      const newValue = 'randomText';

      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, newValue);
        formContext?.setValue(inputDefinitions[1].name, newValue);
      });

      expect(formContext?.getManyValues([inputDefinitions[0].name, inputDefinitions[1].name])).toEqual([
        newValue,
        newValue,
      ]);
    });

    it('Should call event listener for Event.getMany', async () => {
      const listener = jest.fn();

      addEventListener(Event.getMany, listener);
      await act(() => {
        formContext?.getManyValues([inputDefinitions[0].name, inputDefinitions[1].name]);
      });

      expect(listener).toHaveBeenCalledWith(Object.values(initialState));
    });

    it('Should include undefined if the key does not exist', async () => {
      expect(formContext?.getManyValues([inputDefinitions[0].name, 'foo'])).toEqual([
        inputDefinitions[0].initialValue || '',
        undefined,
      ]);
    });

    it('Should keep the order of the input array', async () => {
      const newValue = 'randomText';

      await act(() => {
        formContext?.setValue(inputDefinitions[0].name, newValue);
      });

      expect(formContext?.getManyValues([inputDefinitions[1].name, 'foo', inputDefinitions[0].name])).toEqual([
        inputDefinitions[1].initialValue || '',
        undefined,
        newValue,
      ]);
    });
  });

  describe('formContext.clearValue function', () => {
    it('Should set the value to empty string', async () => {
      await act(() => {
        formContext?.clearValue(inputDefinitions[0].name);
      });

      expect(formContext?.getValue(inputDefinitions[0].name)).toBe('');
    });

    it('Should call event listener for Event.clear', async () => {
      const listener = jest.fn();

      addEventListener(Event.clear, listener);
      await act(() => {
        formContext?.clearValue(inputDefinitions[0].name);
      });

      expect(listener).toHaveBeenCalledWith({ name: inputDefinitions[0].name });
    });

    it('Should not re render if the value to clear is already a empty string or the key does not exist', async () => {
      await act(() => {
        formContext?.clearValue(inputDefinitions[1].name);
        formContext?.clearValue('foo');
      });

      expect(renderCount).toBe(1);
    });

    it('Should not call event listener for Event.clear if the value to clear is already a empty string or the key does not exist', async () => {
      const listener = jest.fn();

      addEventListener(Event.clear, listener);
      await act(() => {
        formContext?.clearValue(inputDefinitions[1].name);
        formContext?.clearValue('foo');
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  // describe('formContext.clearAllValues function', () => {
  //   it('Should set all the values to empty string', async () => {
  //     await act(() => {
  //       formContext?.clearAllValues();
  //     });

  //     inputDefinitions.forEach(({ name }) => {
  //       expect(formContext?.getValue(name)).toBe('');
  //     });
  //   });

  //   it('Should call event listener for Event.clearAll', async () => {
  //     const listener = jest.fn();

  //     addEventListener(Event.clearAll, listener);
  //     await act(() => {
  //       formContext?.clearAllValues();
  //     });

  //     expect(listener).toHaveBeenCalledWith({ name: inputDefinitions });
  //   });

  //   it('Should not re render if the value to clear is already a empty string or the key does not exist', async () => {
  //     await act(() => {
  //       formContext?.clearValue(inputDefinitions[1].name);
  //       formContext?.clearValue('foo');
  //     });

  //     expect(renderCount).toBe(1);
  //   });

  //   it('Should not call event listener for Event.clear if the value to clear is already a empty string or the key does not exist', async () => {
  //     const listener = jest.fn();

  //     addEventListener(Event.clear, listener);
  //     await act(() => {
  //       formContext?.clearValue(inputDefinitions[1].name);
  //       formContext?.clearValue('foo');
  //     });

  //     expect(listener).not.toHaveBeenCalled();
  //   });
  // });

  describe('formContext.resetValue function', () => {
    it('Should set the value to initialValue', async () => {
      await act(() => {
        formContext?.clearValue(inputDefinitions[0].name);
      });

      expect(formContext?.getValue(inputDefinitions[0].name)).not.toBe(inputDefinitions[0].initialValue);

      await act(() => {
        formContext?.resetValue(inputDefinitions[0].name);
      });

      expect(formContext?.getValue(inputDefinitions[0].name)).toBe(inputDefinitions[0].initialValue);
    });

    it('Should call event listener for Event.reset', async () => {
      const listener = jest.fn();

      addEventListener(Event.reset, listener);
      await act(() => {
        formContext?.clearValue(inputDefinitions[0].name);
        formContext?.resetValue(inputDefinitions[0].name);
      });

      expect(listener).toHaveBeenCalledWith({ name: inputDefinitions[0].name });
    });

    it('Should not re render if the value to reset is already a the initial value or the key does not exist', async () => {
      await act(() => {
        formContext?.resetValue(inputDefinitions[1].name);
        formContext?.resetValue('foo');
      });

      expect(renderCount).toBe(1);
    });

    it('Should not call event listener for Event.reset if the value to reset is already a the initial value or the key does not exist', async () => {
      const listener = jest.fn();

      addEventListener(Event.clear, listener);
      await act(() => {
        formContext?.resetValue(inputDefinitions[1].name);
        formContext?.resetValue('foo');
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
