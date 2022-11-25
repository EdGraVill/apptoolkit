import type { State } from './state';
import { compareValues, composeState, valuesFromInputDefinitions } from './state';

describe('compareValues', () => {
  const values = { field: 'value' };

  it('Should return the original values object if the second is equal', () => {
    const copy = values;

    const result = compareValues(values, copy);

    expect(result).toBe(values);
  });

  it('Should return the original values object if the second has the same shape and values', () => {
    const copy = { field: 'value' };

    const result = compareValues(values, copy);

    expect(result).toBe(values);
  });

  it('Should return the second values object if is different of the first one', () => {
    const copy = { field: 'differentValue' };

    const result = compareValues(values, copy);

    expect(result).toBe(copy);
  });

  it('Should call the side function with false if the second values object if is different of the first one', () => {
    const sideFunction = jest.fn();
    const copy = { field: 'differentValue', otherField: 'otherValue' };

    const result = compareValues(values, copy, sideFunction);

    expect(result).toBe(copy);
    expect(sideFunction).toHaveBeenCalledWith(false);
  });
});

describe('valuesFromInputDefinitions', () => {
  it('Should create a values object from the input definitions', () => {
    const expectedValues = { foo: '' };

    const values = valuesFromInputDefinitions([{ name: 'foo' }]);

    expect(values).toEqual(expectedValues);
  });

  it('Should create a values object from the input definitions and keep previous values', () => {
    const previousValues = { field: 'value' };
    const expectedValues = { ...previousValues, foo: 'value' };

    const values = valuesFromInputDefinitions(
      [{ name: 'field' }, { initialValue: 'value', name: 'foo' }],
      previousValues,
    );

    expect(values).toEqual(expectedValues);
  });
});

describe('composeState', () => {
  it('Should create a state object using the input definitions and the current values', () => {
    const inputDefinitions = [{ name: 'field' }, { initialValue: 'value', name: 'foo' }];
    const values = { field: 'value', foo: '' };
    const expectedValues: State = {
      field: {
        feedback: [],
        initialValue: undefined,
        name: 'field',
        validators: undefined,
        value: 'value',
      },
      foo: {
        feedback: [],
        initialValue: 'value',
        name: 'foo',
        validators: undefined,
        value: '',
      },
    };

    const result = composeState(inputDefinitions, values);

    expect(result).toEqual(expectedValues);
  });
});
