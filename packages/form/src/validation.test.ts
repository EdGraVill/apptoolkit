import type { Feedback } from './validation';
import { Severity, commonValidators, feedbackize, validate } from './validation';

describe('feedbackize function', () => {
  it('Should return same undefined as provided if is a undefined input', () => {
    const feedback = feedbackize(undefined);

    expect(feedback).toBeUndefined();
  });

  it('Should return same value as provided if is a Feedback value', () => {
    const inputFeedback: Feedback = { message: 'foo', severity: Severity.info };
    const feedback = feedbackize(inputFeedback);

    expect(feedback).toBe(inputFeedback);
  });

  it('Should return a Info Feedback if the input is a string', () => {
    const message = 'foo';

    const feedback = feedbackize(message);

    expect(feedback).toHaveProperty('message', message);
    expect(feedback).toHaveProperty('severity', Severity.info);
  });

  it('Should return an Error Feedback if the input is false', () => {
    const feedback = feedbackize(false);

    expect(feedback).toHaveProperty('severity', Severity.error);
  });

  it('Should return undefined if the input is true', () => {
    const feedback = feedbackize(true);

    expect(feedback).toBeUndefined();
  });
});

describe('validate function', () => {
  it('Should return an empty array of Feedback objects if no validator is provided', () => {
    const result = validate('foo', undefined);

    expect(result).toBeInstanceOf(Array);
  });

  it('Should evaluate every validation function and return the Feedback object result', () => {
    const validator1 = jest.fn((value: string) => !!value);
    const validator2 = jest.fn((value: string) => (value ? `Value is: ${value}` : false));
    const value = 'foo';

    const result = validate(value, [validator1, validator2]);

    expect(validator1).toHaveBeenCalledWith(value);
    expect(validator2).toHaveBeenCalledWith(value);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(feedbackize(validator2(value)));
  });
});

describe('commonValidators', () => {
  it('Should return undefined with includesCapital if assertion is pass', () => {
    const value = 'Capital';
    const message = 'Capital letter required';

    const result = commonValidators.includesCapitalBuilder(message)(value);

    expect(result).toBeUndefined();
  });
  it('Should return a Feedback with error severity with includesCapital if assertion fails', () => {
    const value = 'lower';
    const message = 'Capital letter required';

    const result = commonValidators.includesCapitalBuilder(message)(value);

    expect(result).toEqual({ message, severity: Severity.error });
  });

  it('Should return undefined with includesNumberBuilder if assertion is pass', () => {
    const value = 'numb3r';
    const message = 'Number required';

    const result = commonValidators.includesNumberBuilder(message)(value);

    expect(result).toBeUndefined();
  });
  it('Should return a Feedback with error severity with includesNumberBuilder if assertion fails', () => {
    const value = 'number';
    const message = 'Number required';

    const result = commonValidators.includesNumberBuilder(message)(value);

    expect(result).toEqual({ message, severity: Severity.error });
  });

  it('Should return undefined with isEmailBuilder if assertion is pass', () => {
    const value = 'mail@test.com';
    const message = 'Invalid email';

    const result = commonValidators.isEmailBuilder(message)(value);

    expect(result).toBeUndefined();
  });
  it('Should return a Feedback with error severity with isEmailBuilder if assertion fails', () => {
    const value = 'mail@test';
    const message = 'Invalid email';

    const result = commonValidators.isEmailBuilder(message)(value);

    expect(result).toEqual({ message, severity: Severity.error });
  });

  it('Should return undefined with isRequiredBuilder if assertion is pass', () => {
    const value = 'foo';
    const message = 'Value required';

    const result = commonValidators.isRequiredBuilder(message)(value);

    expect(result).toBeUndefined();
  });
  it('Should return a Feedback with error severity with isRequiredBuilder if assertion fails', () => {
    const value = '';
    const message = 'Value required';

    const result = commonValidators.isRequiredBuilder(message)(value);

    expect(result).toEqual({ message, severity: Severity.error });
  });
});
