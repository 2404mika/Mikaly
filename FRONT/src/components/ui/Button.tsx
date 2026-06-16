import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-body text-label-md transition-[transform,box-shadow,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-primary text-on-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20',
      secondary: 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high',
      tertiary: 'bg-tertiary-container text-on-tertiary hover:opacity-90 hover:shadow-lg hover:shadow-tertiary/20',
      ghost: 'text-on-surface-variant hover:bg-surface-container-high',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-label-md',
      lg: 'px-6 py-3 text-body-md',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {disabled ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
