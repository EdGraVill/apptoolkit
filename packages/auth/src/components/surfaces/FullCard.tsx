import type { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const FullCard: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div>
    <div className="flex min-h-screen items-center justify-center bg-white sm:bg-transparent">
      <div className={twMerge('w-full max-w-md rounded-lg bg-white align-middle sm:shadow-md', className)} {...props} />
    </div>
  </div>
);

export default FullCard;
