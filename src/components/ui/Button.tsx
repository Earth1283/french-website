import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'onEnamel' | 'danger';
export type ButtonSize = 'md' | 'sm';

interface ButtonLook {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconOnly?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  quiet: 'btn--quiet',
  onEnamel: 'btn--on-enamel',
  danger: 'btn--danger',
};

export function buttonClass({ variant = 'primary', size = 'md', block, iconOnly }: ButtonLook, extra?: string) {
  return ['btn', VARIANT_CLASS[variant], size === 'sm' && 'btn--sm', block && 'btn--block', iconOnly && 'btn--icon', extra]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonLook;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, iconOnly, className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonClass({ variant, size, block, iconOnly }, className)} {...props} />;
});

export function ButtonLink({ variant, size, block, iconOnly, className, ...props }: LinkProps & ButtonLook) {
  return <Link className={buttonClass({ variant, size, block, iconOnly }, className)} {...props} />;
}
