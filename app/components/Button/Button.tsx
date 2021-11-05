import Link from 'next/link';
import { joinClasses } from '../../utils';
import { Icon } from '../Icon';

export enum ButtonVariant {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
}

export type ButtonProps = (AnchorElementProps | ButtonElementProps) & {
  disabled?: boolean;
  icon?: string;
  iconType?: 'outline';
  loading?: boolean;
  outline?: boolean;
  variant?: ButtonVariant;
};

interface AnchorElementProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  as: 'a';
}

interface ButtonElementProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  as?: 'button';
}

export const Button = ({
  as = 'button',
  children,
  icon,
  iconType,
  variant = ButtonVariant.primary,
  loading,
  disabled,
  outline,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const classes = joinClasses(
    'p-2 focus:outline-none border-2 disabled:opacity-40 disabled:cursor-not-allowed',
    outline ? outlineClasses(variant) : primaryClasses(variant),
    !isDisabled
      ? outline
        ? outlineHoverClasses(variant)
        : primaryHoverClasses(variant)
      : null,
    icon ? 'flex items-center rounded-full' : 'rounded-md',
    props.className
  );
  const child = icon ? (
    <Icon name={icon} outline={iconType === 'outline'} />
  ) : (
    children
  );

  if (as === 'a') {
    return (
      <Link href={(props as AnchorElementProps).href} passHref>
        <a className={classes}>{child}</a>
      </Link>
    );
  }

  return (
    <button {...(props as ButtonElementProps)} className={classes}>
      {child}
    </button>
  );
};

function primaryClasses(variant: ButtonVariant) {
  const variantClasses: {
    [key in ButtonVariant]: string;
  } = {
    primary: 'bg-button-primary border-button-primary',
    secondary: 'bg-button-secondary border-button-secondary',
    tertiary: 'bg-button-tertiary border-button-tertiary',
  };
  return ['text-white', variantClasses[variant]].join(' ');
}

function primaryHoverClasses(variant: ButtonVariant) {
  const variantClasses: {
    [key in ButtonVariant]: string;
  } = {
    primary: 'hover:text-button-primary',
    secondary: 'hover:text-button-secondary',
    tertiary: 'hover:text-button-tertiary',
  };
  return ['hover:bg-white', variantClasses[variant]].join(' ');
}

function outlineClasses(variant: ButtonVariant) {
  const variantClasses: {
    [key in ButtonVariant]: string;
  } = {
    primary: 'text-button-primary border-button-primary',
    secondary: 'text-button-secondary border-button-secondary',
    tertiary: 'text-button-tertiary border-button-tertiary',
  };
  return ['bg-white', variantClasses[variant]].join(' ');
}

function outlineHoverClasses(variant: ButtonVariant) {
  const variantClasses: {
    [key in ButtonVariant]: string;
  } = {
    primary: 'hover:bg-button-primary',
    secondary: 'hover:bg-button-secondary',
    tertiary: 'hover:bg-button-tertiary',
  };
  return ['hover:text-white', variantClasses[variant]].join(' ');
}
