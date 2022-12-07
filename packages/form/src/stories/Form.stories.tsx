import type { Context, InputDefinition } from '../';
import Form from '../';
import { CancelInput, EmailInput, FirstNameInput, LastNameInput, PasswordInput, SubmitInput } from './Inputs';
import styles from './styles.module.scss';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/jest';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { useCallback, useEffect, useState } from 'react';

export default {
  component: Form,
  title: 'Form',
} as ComponentMeta<typeof Form>;

const Template: ComponentStory<typeof Form> = (args) => <Form {...args} />;

const inputDefinitions: Record<string, InputDefinition> = {
  email: {
    name: 'email',
    validators: [
      Form.commonValidators.isRequiredBuilder('Email required'),
      Form.commonValidators.isEmailBuilder('Wrong email format'),
    ],
  },
  firstName: {
    name: 'firstName',
    validators: [Form.commonValidators.isRequiredBuilder('First name required')],
  },
  lastName: {
    name: 'lastName',
    validators: [Form.commonValidators.isRequiredBuilder('Last name required')],
  },
  password: {
    name: 'password',
    validators: [
      Form.commonValidators.isRequiredBuilder('Password required'),
      Form.commonValidators.includesNumberBuilder('Password must include a number'),
      Form.commonValidators.includesCapitalBuilder('Password must include a capital letter'),
    ],
  },
};

export const ComplexUsage = Template.bind({});
ComplexUsage.args = {
  children: (
    <>
      <Form.HTMLInputWrapper name="email">{EmailInput}</Form.HTMLInputWrapper>
      <Form.HTMLInputWrapper name="password">{PasswordInput}</Form.HTMLInputWrapper>
      <Form.HTMLInputWrapper>{CancelInput}</Form.HTMLInputWrapper>
      <Form.HTMLInputWrapper>{SubmitInput}</Form.HTMLInputWrapper>
    </>
  ),
  inputDefinitions: [inputDefinitions.email, inputDefinitions.password],
  onSubmit(formContext) {
    const isValid = formContext.isValid(['email', 'password']);

    if (isValid) {
      console.log(`Signed in with ${formContext.getValue('email')}`);
    }
  },
};
ComplexUsage.decorators = [
  (LoginForm, args) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const { clearAllValues, signal } = Form.useSignal();

    useEffect(() => {
      clearAllValues();
    }, [isSignIn]);

    const onSignUpSubmit = useCallback((formContext: Context) => {
      const isValid = formContext.isValid(['firstName', 'lastName', 'email', 'password']);

      if (isValid) {
        action(
          `Signed up ${formContext.getValue('firstName')} ${formContext.getValue(
            'lastName',
          )} with ${formContext.getValue('email')}`,
        );
      }
    }, []);

    const switchScreen = useCallback(() => {
      setIsSignIn((prev) => !prev);
    }, []);

    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-100">
        <main className="grid grid-cols-2 gap-4 max-w-sm bg-white shadow-lg w-full px-8 py-10 rounded-lg border border-slate-300">
          <h1 className="col-span-2 text-center text-2xl mb-4">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>
          {isSignIn ? (
            <LoginForm args={{ ...args.args, signal }} />
          ) : (
            <Form
              inputDefinitions={[
                inputDefinitions.firstName,
                inputDefinitions.lastName,
                inputDefinitions.email,
                inputDefinitions.password,
              ]}
              onSubmit={onSignUpSubmit}
            >
              <Form.HTMLInputWrapper name="firstName">{FirstNameInput}</Form.HTMLInputWrapper>
              <Form.HTMLInputWrapper name="lastName">{LastNameInput}</Form.HTMLInputWrapper>
              <Form.HTMLInputWrapper name="email">{EmailInput}</Form.HTMLInputWrapper>
              <Form.HTMLInputWrapper name="password">{PasswordInput}</Form.HTMLInputWrapper>
              <Form.HTMLInputWrapper>{CancelInput}</Form.HTMLInputWrapper>
              <Form.HTMLInputWrapper>{SubmitInput}</Form.HTMLInputWrapper>
            </Form>
          )}
          <p className="text-sm mt-4">
            Or you can{' '}
            <button className="text-indigo-400 cursor-pointer inline-block" onClick={switchScreen}>
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </main>
      </div>
    );
  },
];

const loginForm = (
  <>
    <Form.HTMLInputWrapper name="email">
      {({ onBlur, onChange, value, feedback, isDirty }) => (
        <label className={styles.input}>
          <span>Email:</span>
          <input data-testid="emailInput" onBlur={onBlur} onChange={onChange} type="text" value={value} />
          {isDirty && !!feedback.length && <p>{feedback[0].message}</p>}
        </label>
      )}
    </Form.HTMLInputWrapper>
    <Form.HTMLInputWrapper name="password">
      {({ feedback, isDirty, onBlur, onChange, value }) => (
        <label className={styles.input}>
          <span>Password:</span>
          <input data-testid="passwordInput" onBlur={onBlur} onChange={onChange} type="password" value={value} />
          <small>{value}</small>
          {isDirty && !!feedback.length && <p>{feedback[0].message}</p>}
        </label>
      )}
    </Form.HTMLInputWrapper>
    <Form.HTMLInputWrapper>
      {({ formContext: { submit } }) => (
        <button onClick={submit} role="submit">
          Submit
        </button>
      )}
    </Form.HTMLInputWrapper>
  </>
);

const loginInputDefinitions = [
  { name: 'email', validators: [Form.commonValidators.isRequiredBuilder('Email required')] },
  { name: 'password', validators: [Form.commonValidators.isRequiredBuilder('Password required')] },
];

export const OnSubmitHandling = Template.bind({});
OnSubmitHandling.args = {
  children: loginForm,
  inputDefinitions: loginInputDefinitions,
};
OnSubmitHandling.decorators = [
  (Frm, args) => {
    const [values, setValues] = useState({ email: '', password: '' });

    const onSubmit = useCallback((formContext: Context) => {
      const areValid = formContext.isValid(['email', 'password']);

      if (areValid) {
        setValues({ email: formContext.getValue('email') ?? '', password: formContext.getValue('password') ?? '' });
      }
    }, []);

    return (
      <>
        <Frm args={{ ...args.args, onSubmit }} />
        <pre>{JSON.stringify(values)}</pre>
      </>
    );
  },
];
OnSubmitHandling.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const values = {
    email: 'test@mail.com',
    password: 'Password',
  };
  const emailInput = canvas.getByTestId('emailInput');
  const passwordInput = canvas.getByTestId('passwordInput');
  const submitButton = canvas.getByRole('submit');

  await userEvent.type(emailInput, values.email);
  userEvent.clear(emailInput);
  userEvent.click(passwordInput);

  await waitFor(() => expect(canvas.queryByText('Email required')).toBeInTheDocument());

  await userEvent.type(emailInput, values.email);
  await userEvent.type(passwordInput, values.password);

  userEvent.click(submitButton);

  await waitFor(() => expect(canvas.queryByText(JSON.stringify(values))).toBeInTheDocument());
};

export const EventListenerHandling = Template.bind({});
EventListenerHandling.args = {
  children: loginForm,
  inputDefinitions: loginInputDefinitions,
};
EventListenerHandling.decorators = [
  (Frm) => {
    const [values, setValues] = useState({ email: '', password: '' });

    useEffect(() => {
      const removeListener = Form.addEventListener(Form.Event.submit, (formContext) => {
        const areValid = formContext.isValid(['email', 'password']);

        if (areValid) {
          setValues({ email: formContext.getValue('email') ?? '', password: formContext.getValue('password') ?? '' });
        }
      });

      return () => {
        removeListener();
      };
    }, []);

    return (
      <>
        <Frm />
        <pre>{JSON.stringify(values)}</pre>
      </>
    );
  },
];
EventListenerHandling.play = OnSubmitHandling.play;

export const SignalHandling = Template.bind({});
SignalHandling.args = {
  children: loginForm,
  inputDefinitions: loginInputDefinitions,
};
SignalHandling.decorators = [
  (Frm, args) => {
    const [values, setValues] = useState({ email: '', password: '' });
    const { resetAllValues, signal } = Form.useSignal();

    useEffect(() => {
      const removeListener = Form.addEventListener(Form.Event.submit, (formContext) => {
        const areValid = formContext.isValid(['email', 'password']);

        if (areValid) {
          setValues({ email: formContext.getValue('email') ?? '', password: formContext.getValue('password') ?? '' });
        }
      });

      return () => {
        removeListener();
      };
    }, []);

    return (
      <>
        <Frm args={{ ...args.args, signal }} />
        <button onClick={resetAllValues} role="reset">
          Reset Form
        </button>
        <pre>{JSON.stringify(values)}</pre>
      </>
    );
  },
];
SignalHandling.play = async (ctx) => {
  await OnSubmitHandling.play?.(ctx);
  const canvas = within(ctx.canvasElement);

  const resetButton = canvas.getByRole('reset');
  const emailInput = canvas.getByTestId<HTMLInputElement>('emailInput');
  const passwordInput = canvas.getByTestId<HTMLInputElement>('passwordInput');

  if (resetButton) {
    userEvent.click(resetButton);

    await waitFor(() => expect(emailInput.value).toBe(''));
    await waitFor(() => expect(passwordInput.value).toBe(''));
    await waitFor(() => expect(canvas.queryByText('Email required')).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.queryByText('Password required')).not.toBeInTheDocument());
  }
};
