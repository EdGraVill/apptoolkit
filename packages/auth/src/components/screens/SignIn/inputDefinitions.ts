import type { InputDefinition } from '@apptoolkit/form';
import Form from '@apptoolkit/form';

import { autoFiller } from '@util';

const inputDefinitions: InputDefinition[] = [
  {
    initialValue: autoFiller('test@mail.com'),
    name: 'email',
    validators: [
      Form.commonValidators.isRequiredBuilder('Email required'),
      Form.commonValidators.isEmailBuilder('Invalid email format'),
    ],
  },
  {
    initialValue: autoFiller('Password1'),
    name: 'password',
    validators: [
      Form.commonValidators.isRequiredBuilder('Password required'),
      Form.commonValidators.includesCapitalBuilder('Missing uppercase letter'),
      Form.commonValidators.includesNumberBuilder('Missing number character'),
      Form.commonValidators.includesLowercaseBuilder('Missing lowercase letter'),
      Form.commonValidators.minLengthBuilder('At least include 8 characters')(8),
      Form.commonValidators.minLengthBuilder(
        (value) =>
          value.length >= 8
            ? `Having ${value.length} characters is fine. However, having 12 characters at least provides more security`
            : '',
        Form.Severity.warning,
      )(12),
      Form.commonValidators.isRequiredBuilder(
        'Password must include an uppercase letter, a lowercase letter, and a number, and contain at least 8 characters',
        Form.Severity.info,
      ),
    ],
  },
];

export default inputDefinitions;
