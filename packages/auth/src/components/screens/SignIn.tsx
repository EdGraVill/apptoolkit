import { FullCard } from '../surfaces';
import type { InputDefinition, Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';
import type { Credentials } from '@controllers/signIn';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

interface Props {
  onSignIn(credentials: Credentials): Promise<void>;
}

const inputDefinitions: InputDefinition[] = [
  {
    name: 'email',
    validators: [
      Form.commonValidators.isRequiredBuilder('Email required'),
      Form.commonValidators.isEmailBuilder('Invalid email format'),
    ],
  },
  {
    name: 'password',
    validators: [
      Form.commonValidators.isRequiredBuilder('Password required'),
      Form.commonValidators.includesCapitalBuilder('Missing uppercase letter'),
      Form.commonValidators.includesNumberBuilder('Missing number character'),
      (value) =>
        !value.match(/[a-z]/) ? { message: 'Missing lowercase letter', severity: Form.Severity.error } : undefined,
      (value) =>
        value.length < 8 ? { message: 'At least include 8 characters', severity: Form.Severity.error } : undefined,
      (value) =>
        value.length >= 8 && value.length < 12
          ? {
              message: `Having ${value.length} characters is fine. However, having 12 characters at least provides more security`,
              severity: Form.Severity.warning,
            }
          : undefined,
      (value) =>
        !value
          ? {
              message:
                'Password must include an uppercase letter, a lowercase letter, and a number, and contain at least 8 characters',
              severity: Form.Severity.info,
            }
          : undefined,
    ],
  },
];

const SignIn: FC<Props> = ({ onSignIn }) => {
  const [isLoading, setLoadingState] = useState(false);

  const onSubmit = useCallback(async (context: Context) => {
    setLoadingState(true);
    const isValid = context.isValid(['email', 'password']);
    const [email, password] = context.getManyValues(['email', 'password']);

    if (isValid && email && password) {
      try {
        await onSignIn({ email, password });
        setLoadingState(false);
      } catch (error) {
        setLoadingState(false);
      }
    } else {
      setLoadingState(false);
    }
  }, []);

  return (
    <FullCard>
      <h1 className="text-xl text-center font-semibold font-sans">Sign In</h1>
      <div className="max-w-xs mx-auto my-10 grid-cols-1 gap-y-6 grid">
        <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
          <TextInput label="Email" name="email" />
          <TextInput label="Password" name="password" type="password" />
          <Form.HTMLInputWrapper>
            {({ formContext }) => (
              <Button isDisabled={isLoading} isLoading={isLoading} onClick={formContext.submit}>
                Enter
              </Button>
            )}
          </Form.HTMLInputWrapper>
        </Form>
      </div>
    </FullCard>
  );
};

export default SignIn;
