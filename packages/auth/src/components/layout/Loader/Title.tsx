import type { FC, HTMLAttributes } from 'react';
import { Suspense, lazy } from 'react';

import LayoutTitle from '../CenteredCard/Title';

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  error?: string;
  success?: string;
}

export const Title: FC<TitleProps> = (props) => {
  const LoadedTitle = lazy<typeof LayoutTitle>(
    () => import(`@components/layout/${process.env.LAYOUT ?? 'CenteredCard'}/Title`),
  );

  return (
    <Suspense fallback={<LayoutTitle {...props} />}>
      <LoadedTitle {...props} />
    </Suspense>
  );
};

export default Title;
