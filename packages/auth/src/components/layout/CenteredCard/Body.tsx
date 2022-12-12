import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { FullCard } from '@components/surfaces';

const Body = forwardRef<HTMLBodyElement, HTMLAttributes<HTMLBodyElement>>(function Body(
  { className, children, ...props },
  ref,
) {
  return (
    <body className={twMerge('m-0 bg-background p-0', className)} {...props} ref={ref}>
      <FullCard className="overflow-hidden px-0">{children}</FullCard>
    </body>
  );
});

export default Body;
