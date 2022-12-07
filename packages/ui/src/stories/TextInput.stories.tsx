import { TextInput } from '../input';
import Form from '@apptoolkit/form';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import * as React from 'react';

export default {
  argTypes: {
    label: {
      defaultValue: '',
      type: 'string',
    },
    name: {
      table: {
        disable: true,
      },
    },
    type: {
      table: {
        disable: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <Form
        inputDefinitions={[
          {
            name: 'age',
            validators: [
              Form.commonValidators.isRequiredBuilder('Age required'),
              (value) =>
                parseInt(value) < 21
                  ? { message: 'You must be over 21 years old', severity: Form.Severity.warning }
                  : undefined,
            ],
          },
          {
            name: 'email',
            validators: [
              (value) =>
                value?.match(/(gmail|hotmail|outlook)/)
                  ? { message: 'Provide a company email', severity: Form.Severity.warning }
                  : undefined,
              Form.commonValidators.isRequiredBuilder('Email required'),
              Form.commonValidators.isEmailBuilder('Email format incorrect'),
            ],
          },
          {
            name: 'name',
            validators: [
              Form.commonValidators.isRequiredBuilder('Name required'),
              () => ({ message: 'We use your name to identify you', severity: Form.Severity.info }),
            ],
          },
          {
            name: 'password',
            validators: [
              Form.commonValidators.isRequiredBuilder('Password required'),
              Form.commonValidators.includesNumberBuilder('Should include a number'),
              (value) =>
                !value ? { message: 'Should include letters and numbers', severity: Form.Severity.info } : undefined,
              (value) =>
                value?.length < 10 && value?.length > 6
                  ? {
                      message:
                        'Password is acceptable, however we encorage you to secure it even more by adding more characters',
                      severity: Form.Severity.warning,
                    }
                  : undefined,
            ],
          },
        ]}
      >
        <Story />
      </Form>
    ),
  ],
  title: 'Input/TextInput',
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (args) => <TextInput {...args} />;

export const TypeText = Template.bind({});
TypeText.args = {
  label: 'Name',
  name: 'name',
  type: 'text',
};

export const TypeEmail = Template.bind({});
TypeEmail.args = {
  label: 'Email',
  name: 'email',
  placeholder: "Your company's email",
  type: 'email',
};

export const TypeNumber = Template.bind({});
TypeNumber.args = {
  label: 'Age',
  name: 'age',
  type: 'number',
};

export const TypePassword = Template.bind({});
TypePassword.args = {
  label: 'Password',
  name: 'password',
  type: 'password',
};
