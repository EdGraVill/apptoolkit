import type { Feedback } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

function getSeverityColor(isDirty: boolean, feedback: Feedback[]) {
  if (!isDirty || !feedback.length) return 'info';
  if (feedback.find(({ severity }) => severity === Form.Severity.error)) return 'error';
  if (feedback.find(({ severity }) => severity === Form.Severity.warning)) return 'warning';

  return 'info';
}

type TextInputType = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';

export interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label?: string;
  name: string;
  type?: TextInputType;
}

const TextInput = forwardRef<HTMLInputElement, Props>(({ className, label, name, type = 'text', ...props }, ref) => {
  return (
    <Form.HTMLInputWrapper name={name}>
      {({ feedback, isDirty, onBlur, onChange, value }) => {
        const onKeyDown = useCallback(
          (event: KeyboardEvent<HTMLInputElement>) => {
            if (type === 'number' && ['e', '+', '-'].includes(event.key)) {
              event.preventDefault();
            }
          },
          [type],
        );

        const accentColor = getSeverityColor(isDirty, feedback);
        return (
          <label className="block font-sans group pt-2 relative">
            {label && (
              <span
                className={`absolute bg-white block font-semibold group-focus-within:text-${accentColor}-500 left-3 px-1 select-none text-${accentColor}-400 text-xs top-0`}
              >
                {label}
              </span>
            )}
            <input
              className={twMerge(
                `block border border-${accentColor}-300 focus:border-${accentColor}-500 focus:outline-none px-4 py-2 rounded-md text-${accentColor}-900 w-full`,
                className,
              )}
              onBlur={Form.HTMLInputWrapper.mergeEventHandlers(onBlur, props.onBlur)}
              onChange={Form.HTMLInputWrapper.mergeEventHandlers(onChange, props.onChange)}
              onKeyDown={onKeyDown}
              type={type}
              value={value}
              {...props}
              ref={ref}
            />
            {isDirty && (
              <p className="text-xs text-error-500">
                {feedback
                  .filter(({ severity }) => severity === Form.Severity.error)
                  .map(({ message }) => message)
                  .join('. ')}
              </p>
            )}
            {isDirty && (
              <p className="text-xs text-warning-500">
                {feedback
                  .filter(({ severity }) => severity === Form.Severity.warning)
                  .map(({ message }) => message)
                  .join('. ')}
              </p>
            )}
            {!!feedback.filter(({ severity }) => severity === Form.Severity.info).length && (
              <p className="text-xs text-info-500">
                {feedback
                  .filter(({ severity }) => severity === Form.Severity.info)
                  .map(({ message }) => message)
                  .join('. ')}
              </p>
            )}
          </label>
        );
      }}
    </Form.HTMLInputWrapper>
  );
});
TextInput.displayName = 'TextInput';

export default TextInput;
