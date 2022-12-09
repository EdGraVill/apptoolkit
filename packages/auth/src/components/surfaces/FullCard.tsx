import type { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const FullCard: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={twMerge('bg-white w-full max-w-md mx-auto px-10 py-6 rounded-md shadow-md align-middle', className)}
    {...props}
  />
);

export default FullCard;
