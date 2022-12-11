import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  isDisabled?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(({ children, className, isDisabled, isLoading, ...props }, ref) => (
  <button
    className={twMerge(
      'relative cursor-pointer select-none rounded-md border-2 border-slate-200 px-6 py-2 font-sans font-semibold text-slate-800',
      isDisabled ? 'pointer-events-none' : '',
      className,
    )}
    disabled={isDisabled}
    {...props}
    ref={ref}
  >
    <span className={isLoading ? 'invisible' : ''}>{children}</span>
    {isLoading && (
      <span className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
    )}
  </button>
));
Button.displayName = 'Button';

export default Button;
