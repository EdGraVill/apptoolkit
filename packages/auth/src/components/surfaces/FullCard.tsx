import type { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const FullCard: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div>
    <div className="min-h-screen bg-white flex justify-center items-center sm:bg-transparent">
      <div
        className={twMerge('bg-white w-full max-w-md px-14 py-10 rounded-lg sm:shadow-md align-middle', className)}
        {...props}
      />
    </div>
  </div>
);

export default FullCard;
