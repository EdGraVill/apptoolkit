import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import Form from '../';
import styles from './styles.module.scss';

export default {
  component: Form.HTMLInputWrapper,
  title: 'HTMLInputWrapper',
} as ComponentMeta<typeof Form.HTMLInputWrapper>;

const Template: ComponentStory<typeof Form.HTMLInputWrapper> = (args) => <Form.HTMLInputWrapper {...args} />;

export const WrapperWithoutNameProp = Template.bind({});
WrapperWithoutNameProp.args = {
  children({ formContext }) {
    return (
      <textarea
        onChange={() => formContext.clearValue('email')}
        value={
          formContext.getFeedback('email').length
            ? formContext.getFeedback('email')[0].message
            : `The email is: ${formContext.getValue('email')}`
        }
      />
    );
  },
};
WrapperWithoutNameProp.decorators = [
  (Wrapper) => (
    <Form
      inputDefinitions={[
        {
          name: 'email',
          validators: [
            Form.commonValidators.isRequiredBuilder('Email required'),
            Form.commonValidators.isEmailBuilder('Enter a valid email'),
          ],
        },
      ]}
    >
      <Form.HTMLInputWrapper name="email">
        {({ feedback, isDirty, ...inputProps }) => (
          <label className={styles.input}>
            <span>Email:</span>
            <input data-testid="emailInput" type="text" {...inputProps} />
            {isDirty && !!feedback.length && <p>{feedback[0].message}</p>}
          </label>
        )}
      </Form.HTMLInputWrapper>
      <Wrapper />
    </Form>
  ),
];

export const WrapperWithNameProp = Template.bind({});
WrapperWithNameProp.args = {
  children({ feedback, isDirty, ...inputProps }) {
    return (
      <label className={styles.input}>
        <span>Name:</span>
        <input data-testid="nameInput" type="text" {...inputProps} />
        {isDirty && !!feedback.length && <p>{feedback[0].message}</p>}
      </label>
    );
  },
  name: 'name',
};
WrapperWithNameProp.decorators = [
  (Wrapper) => (
    <Form
      inputDefinitions={[
        {
          name: 'name',
          validators: [Form.commonValidators.isRequiredBuilder('Name required')],
        },
      ]}
    >
      <Wrapper />
      <Wrapper />
    </Form>
  ),
];
