import { Button, ButtonProps } from './Button';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Button',
  component: Button,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    outline: {
      control: 'boolean',
    },
    variant: {
      options: ['primary', 'secondary', 'tertiary'],
      type: 'select',
    },
  },
};

const Template = (args: ButtonProps) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  disabled: false,
  loading: false,
  outline: false,
  variant: 'primary',
  children: 'Primary Button',
};

export const PrimaryOutline = Template.bind({});
PrimaryOutline.args = {
  ...Primary.args,
  outline: true,
  variant: 'primary',
  children: 'Primary Outline Button',
};

export const PrimaryIconButton = Template.bind({});
PrimaryIconButton.args = {
  ...Primary.args,
  variant: 'primary',
  icon: 'phone',
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Primary.args,
  variant: 'secondary',
  children: 'Secondary Button',
};

export const SecondaryOutline = Template.bind({});
SecondaryOutline.args = {
  ...PrimaryOutline.args,
  variant: 'secondary',
  children: 'Secondary Outline Button',
};

export const SecondaryIconButton = Template.bind({});
SecondaryIconButton.args = {
  ...Primary.args,
  variant: 'secondary',
  icon: 'phone',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  ...Primary.args,
  variant: 'tertiary',
  children: 'Tertiary Button',
};

export const TertiaryOutline = Template.bind({});
TertiaryOutline.args = {
  ...PrimaryOutline.args,
  variant: 'tertiary',
  children: 'Tertiary Outline Button',
};

export const TertiaryIconButton = Template.bind({});
TertiaryIconButton.args = {
  ...Primary.args,
  variant: 'tertiary',
  icon: 'phone',
};
