import { Button } from '../input';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import * as React from 'react';

export default {
  argTypes: {
    isDisabled: {
      type: 'boolean',
    },
    isLoading: {
      type: 'boolean',
    },
    onClick: {
      action: 'clicked',
      table: {
        disable: true,
      },
    },
  },
  title: 'Input/Button',
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Styless = Template.bind({});
Styless.args = {
  children: 'Click me',
};

export const Styled = Template.bind({});
Styled.args = {
  children: 'Click me',
  className: 'bg-blue-500 border-0 text-white',
};

export const StyledState = Template.bind({});
StyledState.args = {
  children: 'Click me',
  className: 'bg-blue-500 border-0 text-white disabled:bg-gray-400',
  isDisabled: true,
};
