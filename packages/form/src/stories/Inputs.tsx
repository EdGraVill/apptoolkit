import type { InjectedInputProps, WithoutNameInjectedInputProps } from '../';
import Form from '../';

export const EmailInput = ({ feedback, isDirty, ...inputProps }: InjectedInputProps) => (
  <label className="col-span-2 relative flex flex-col pt-3 group">
    <span
      className={`absolute top-0 left-3 text-sm text-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } bg-white pt-0.5 px-1 group-focus-within:text-indigo-700`}
    >
      Email
    </span>
    <input
      className={`border border-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } rounded-md py-2 px-3 focus:outline-none focus-within:border-indigo-600`}
      {...inputProps}
      type="email"
    />
    {isDirty && !!feedback.length && (
      <span
        className={`text-${feedback[0].severity === Form.Severity.error ? 'rose' : 'zinc'}-400 text-xs pt-1 self-end`}
      >
        {feedback[0].message}
      </span>
    )}
  </label>
);

export const PasswordInput = ({ feedback, isDirty, ...inputProps }: InjectedInputProps) => (
  <label className="col-span-2 relative flex flex-col pt-3 group">
    <span
      className={`absolute top-0 left-3 text-sm text-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } bg-white pt-0.5 px-1 group-focus-within:text-indigo-700`}
    >
      Password
    </span>
    <input
      className={`border border-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } rounded-md py-2 px-3 focus:outline-none focus-within:border-indigo-600`}
      {...inputProps}
      type="password"
    />
    <aside className="pt-1 flex flex-row justify-between">
      <span className="text-gray-400 text-xs">{inputProps.value}</span>
      {isDirty && !!feedback.length && (
        <span className={`text-${feedback[0].severity === Form.Severity.error ? 'rose' : 'zinc'}-400 text-xs`}>
          {feedback[0].message}
        </span>
      )}
    </aside>
  </label>
);

export const FirstNameInput = ({ feedback, isDirty, ...inputProps }: InjectedInputProps) => (
  <label className="col-span-1 relative flex flex-col pt-3 group">
    <span
      className={`absolute top-0 left-3 text-sm text-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } bg-white pt-0.5 px-1 group-focus-within:text-indigo-700`}
    >
      First Name
    </span>
    <input
      className={`border border-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } rounded-md py-2 px-3 focus:outline-none focus-within:border-indigo-600`}
      {...inputProps}
    />
    {isDirty && !!feedback.length && (
      <span
        className={`text-${feedback[0].severity === Form.Severity.error ? 'rose' : 'zinc'}-400 text-xs pt-1 self-end`}
      >
        {feedback[0].message}
      </span>
    )}
  </label>
);

export const LastNameInput = ({ feedback, isDirty, ...inputProps }: InjectedInputProps) => (
  <label className="col-span-1 relative flex flex-col pt-3 group">
    <span
      className={`absolute top-0 left-3 text-sm text-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } bg-white pt-0.5 px-1 group-focus-within:text-indigo-700`}
    >
      Last Name
    </span>
    <input
      className={`border border-${
        isDirty && !!feedback.length && feedback[0].severity === Form.Severity.error ? 'rose-400' : 'gray-500'
      } rounded-md py-2 px-3 focus:outline-none focus-within:border-indigo-600`}
      {...inputProps}
    />
    {isDirty && !!feedback.length && (
      <span
        className={`text-${feedback[0].severity === Form.Severity.error ? 'rose' : 'zinc'}-400 text-xs pt-1 self-end`}
      >
        {feedback[0].message}
      </span>
    )}
  </label>
);
export const SubmitInput = ({ formContext }: WithoutNameInjectedInputProps) => (
  <button className="bg-indigo-400 rounded-md px-3 py-2" onClick={formContext.submit}>
    Submit
  </button>
);
export const CancelInput = ({ formContext }: WithoutNameInjectedInputProps) => (
  <button
    className="border-2 border-indigo-300 rounded-md px-3 py-2 text-indigo-400"
    onClick={formContext.resetAllValues}
  >
    Cancel
  </button>
);
