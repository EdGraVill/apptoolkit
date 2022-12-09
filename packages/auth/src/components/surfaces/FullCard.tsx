import type { FC, PropsWithChildren } from 'react';

const FullCard: FC<PropsWithChildren> = ({ children }) => (
  <div className="bg-white w-full max-w-md mx-auto px-10 py-6 rounded-md shadow-md">{children}</div>
);

export default FullCard;
