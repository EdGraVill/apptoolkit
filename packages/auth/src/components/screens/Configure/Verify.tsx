import type { Context } from '@apptoolkit/form';
import Form from '@apptoolkit/form';
import { Button, TextInput } from '@apptoolkit/ui/dist/input';

import type { FC } from 'react';

import { LayoutTitle } from '@components/layout/Loader';

const inputDefinitions = [
  {
    name: 'code',
    validators: [
      Form.commonValidators.isRequiredBuilder('Verification Code required'),
      Form.commonValidators.isNumericBuilder('Only numbers are allowed'),
      Form.commonValidators.lengthBetweenBuilder('Verification Code should be 6 digits length')(6, 6),
    ],
  },
];

interface Props {
  error?: string;
  isLoading: boolean;
  onCancel(): void;
  onSubmit(context: Context): void;
}

const Verify: FC<Props> = ({ error, isLoading, onCancel, onSubmit }) => (
  <div className="flex w-full flex-col items-center">
    <Form inputDefinitions={inputDefinitions} onSubmit={onSubmit}>
      <LayoutTitle error={error}>Verify</LayoutTitle>
      <p className="px-14 text-center font-sans text-sm">
        Now, use your Authenticator app to get a single use code and type it below
      </p>
      <div className="w-56 flex-1 pt-10">
        <TextInput
          className="px-6 py-3 text-center font-mono text-4xl font-bold tracking-widest"
          disabled={isLoading}
          format={{
            formater: (value) => {
              const trimed = value.replace(/ /g, '').trim();
              const numered = parseInt(trimed);

              if (Number.isNaN(numered)) {
                return value.match(/\d/g)?.join('') ?? '';
              }

              return numered.toString().length > 3 ? `${value.slice(0, 3)} ${value.slice(3, 7)}` : numered.toString();
            },
            parser: (value) => value.replace(/ /g, ''),
          }}
          label="Verification Code"
          name="code"
        />
      </div>
      <div className="my-10 flex w-full flex-row-reverse justify-between px-14">
        <Form.HTMLInputWrapper>
          {({ formContext }) => (
            <Button
              className="border-0 bg-violet-500 text-white transition-colors hover:bg-violet-600"
              isDisabled={isLoading}
              isLoading={isLoading}
              onClick={formContext.submit}
            >
              Send
            </Button>
          )}
        </Form.HTMLInputWrapper>
        <Button
          className="border-0 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          onClick={onCancel}
        >
          Back
        </Button>
      </div>
    </Form>
  </div>
);

export default Verify;
