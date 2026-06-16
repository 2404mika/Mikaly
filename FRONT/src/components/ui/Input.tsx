import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 group">
        {label && (
          <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-[color] duration-200">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-[color] duration-200">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-surface-container-lowest border text-on-surface font-body-md text-body-md rounded-lg py-2.5 ${
              icon ? 'pl-11' : 'pl-4'
            } pr-4 transition-[border-color,box-shadow] duration-200 outline-none ${
              error
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/10'
                : 'border-outline-variant/50 hover:border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="font-label-sm text-label-sm text-error animate-[slideDown_0.2s_ease_both]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
