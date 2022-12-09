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
  (value: string, name?: string): string | boolean | Feedback | undefined;
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

const commonValidatorsFactory = {
  includesCapital: (value: string) => /[A-Z]/.test(value),
  includesNumber: (value: string) => /[0-9]/.test(value),
  isEmail: (value: string) => patterns.email.test(value),
  isRequired: (value: string) => !!value,
} as const;

export const commonValidators = Object.keys(commonValidatorsFactory).reduce(
  (acc, name) => ({
    ...acc,
    [`${name}Builder`]: (message: string, overrideSeverity?: Severity) => (value: string) =>
      !commonValidatorsFactory[name as keyof typeof commonValidatorsFactory](value)
        ? { message, severity: overrideSeverity ?? Severity.error }
        : undefined,
  }),
  {},
) as Record<
  `${keyof typeof commonValidatorsFactory}Builder`,
  (message: string, overrideSeverity?: Severity) => (value: string) => Feedback | undefined
>;
