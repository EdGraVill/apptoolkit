import type { FC, HTMLAttributes } from 'react';

import Title from '../CenteredCard/Title';

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  error?: string;
  success?: string;
}

export const LayoutBody: FC<TitleProps> = (props) => {
  // const LoadedTitle = lazy<typeof Title>(
  //   () => import(`@components/layout/${process.env.LAYOUT ?? 'CenteredCard'}/Title`),
  // );

  // return (
  //   <Suspense fallback={<Title {...props} />}>
  //     <LoadedTitle {...props} />
  //   </Suspense>
  // );

  return <Title {...props} />;
};

export default LayoutBody;
