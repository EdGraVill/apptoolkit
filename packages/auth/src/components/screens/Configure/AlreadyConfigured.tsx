import { FullCard } from '@components/surfaces';
import type { FC } from 'react';

const AlreadyConfigured: FC = () => (
  <FullCard>
    <h1>This account already has configured a 2FA method</h1>
  </FullCard>
);

export default AlreadyConfigured;
