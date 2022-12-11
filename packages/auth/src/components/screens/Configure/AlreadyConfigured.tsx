import type { FC } from 'react';

import { FullCard } from '@components/surfaces';

const AlreadyConfigured: FC = () => (
  <FullCard>
    <h1>This account already has configured a 2FA method</h1>
  </FullCard>
);

export default AlreadyConfigured;
