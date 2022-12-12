import cn from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import type { TitleProps } from '../Loader/Title';

const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title({ error, success, ...props }, ref) {
  return (
    <header className="my-10 w-full px-14">
      <h1
        className={twMerge(
          'w-full border-l-8 py-2 pl-5 text-left font-sans text-3xl font-semibold',
          cn({
            'border-l-error-800 text-error-800': !!error,
            'border-l-primary-800': !error && !success,
            'border-l-success-800 text-success-800': !!success,
          }),
          props.className,
        )}
        {...props}
        ref={ref}
      />
      {!!error && !success && (
        <div className="border-l-8 border-l-error-800 bg-error-300 p-2 text-center text-sm font-semibold text-error-800">
          {error}
        </div>
      )}
      {!!success && !error && (
        <div className="border-l-8 border-l-success-800 bg-success-300 p-2 text-center text-sm font-semibold text-success-800">
          {success}
        </div>
      )}
    </header>
  );
});

export default Title;
