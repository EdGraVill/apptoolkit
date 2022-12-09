export enum Severity {
  info,
  warning,
  error,
}

export interface Feedback {
  message: string;
  severity: Severity;
}

export interface ValidatorFunction {
  (value: string): string | boolean | Feedback | undefined;
}

export function feedbackize(feedback: string | boolean | Feedback | undefined): Feedback | undefined {
  if (typeof feedback === 'object' || typeof feedback === 'undefined') {
    return feedback;
  }

  if (typeof feedback === 'string') {
    return {
      message: feedback,
      severity: Severity.info,
    };
  }

  if (!feedback) {
    return {
      message: '',
      severity: Severity.error,
    };
  }

  return undefined;
}

export function validate(value: string, validators: ValidatorFunction[] | undefined): Feedback[] {
  if (!validators) {
    return [];
  }

  return validators.map((validator) => feedbackize(validator?.(value))).filter(Boolean) as Feedback[];
}

export const patterns = {
  email:
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
};

// CommonValidatorsFactory
const cvf = {
  includesCapital: (value: string) => /[A-Z]/.test(value),
  includesLowercase: (value: string) => /[a-z]/.test(value),
  includesNumber: (value: string) => /[0-9]/.test(value),
  isEmail: (value: string) => patterns.email.test(value),
  isMax: (value: string) => (max: number) => !Number.isNaN(Number(value)) && Number(value) <= max,
  isMin: (value: string) => (min: number) => !Number.isNaN(Number(value)) && Number(value) >= min,
  isNumeric: (value: string) => /^\d+$/.test(value),
  isRequired: (value: string) => !!value,
  lengthBetween: (value: string) => (min: number, max: number) =>
    cvf.minLength(value)(min) && cvf.maxLength(value)(max),
  matchWith: (value: string) => (rgx: RegExp) => rgx.test(value),
  maxLength: (value: string) => (max: number) => (value.length ?? 0) <= max,
  minLength: (value: string) => (min: number) => (value.length ?? 0) >= min,
  numberBetween: (value: string) => (min: number, max: number) => cvf.isMin(value)(min) && cvf.isMax(value)(max),
} as const;

type CVF = typeof cvf;

type CommonValidators = {
  [K in keyof CVF as `${K}Builder`]: ReturnType<CVF[K]> extends boolean
    ? (
        message: string | ((value: string) => string),
        overrideSeverity?: Severity | ((value: string) => Severity),
      ) => (value: string) => Feedback | undefined
    : (
        message: string | ((value: string) => string),
        overrideSeverity?: Severity | ((value: string) => Severity),
      ) => (
        // @ts-ignore
        ...args: Parameters<ReturnType<CVF[K]>>
      ) => (value: string) => Feedback | undefined;
};

export const commonValidators = Object.keys(cvf).reduce(
  (acc, name) => ({
    ...acc,
    [`${name}Builder`]: (
      message: string | ((value: string) => string),
      overrideSeverity?: Severity | ((value: string) => Severity),
    ) => {
      const validatorFn = cvf[name as keyof CVF];
      const test = validatorFn('');

      function responseComposer(value: string, result: boolean) {
        const composedMessage = typeof message === 'function' ? message(value) : message;
        const composedOverrideSeverity =
          typeof overrideSeverity === 'function' ? overrideSeverity(value) : overrideSeverity;

        if (!result && composedMessage) {
          return {
            message: composedMessage,
            severity: composedOverrideSeverity ?? Severity.error,
          };
        }

        return undefined;
      }

      if (typeof test === 'function') {
        return <A extends Parameters<typeof test>>(...args: A) =>
          (value = '') =>
            responseComposer(value, (validatorFn(value) as (...args: A) => boolean)(...args));
      }

      return (value = '') => responseComposer(value, validatorFn(value) as boolean);
    },
  }),
  {},
) as CommonValidators;
