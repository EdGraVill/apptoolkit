import type { HOTPGenerateConfig, HOTPVerifyConfig } from './hotp';
import { generateHOTP, verifyHOTP } from './hotp';

export interface TOTPGenerateConfig extends HOTPGenerateConfig {
  time: number;
}

export function generateTOTP(key: string | Buffer, config: Partial<TOTPGenerateConfig> = {}) {
  const { time, tokenLength } = { ...generateTOTP.defaultConfig, ...config };

  const counter = Math.floor(Date.now() / 1_000 / time);

  return generateHOTP(key, counter, { tokenLength });
}
generateTOTP.defaultConfig = {
  ...generateHOTP.defaultConfig,
  time: 30,
} as TOTPGenerateConfig;

export interface TOTPVerifyConfig extends TOTPGenerateConfig, HOTPVerifyConfig {}

export function verifyTOTP(key: string | Buffer, token: string, config: Partial<TOTPVerifyConfig> = {}) {
  const { time, tokenLength, window } = { ...verifyTOTP.defaultConfig, ...config };

  const counter = Math.floor(Date.now() / 1_000 / time);

  return verifyHOTP(key, token, counter, { tokenLength, window });
}
verifyTOTP.defaultConfig = {
  ...generateTOTP.defaultConfig,
  ...verifyHOTP.defaultConfig,
} as TOTPVerifyConfig;
