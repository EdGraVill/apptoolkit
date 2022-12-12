import type { FC, HTMLAttributes } from 'react';
import { Suspense, lazy } from 'react';

import Body from '../CenteredCard/Body';

export const LayoutBody: FC<HTMLAttributes<HTMLBodyElement>> = (props) => {
  const LoadedBody = lazy<typeof Body>(() => import(`@components/layout/${process.env.LAYOUT ?? 'CenteredCard'}/Body`));

  return (
    <Suspense fallback={<Body {...props} />}>
      <LoadedBody {...props} />
    </Suspense>
  );
};

export default LayoutBody;
