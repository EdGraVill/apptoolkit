import { Buffer } from 'buffer';
import WordArray from 'crypto-js/lib-typedarrays';

import type { TOTPGenerateConfig, TOTPVerifyConfig } from './totp';
import { generateTOTP, verifyTOTP } from './totp';
import { decodeBase32, encodeBase32 } from './base32';

export function decodeSecret(secret: string): Buffer {
  if (secret.length !== 32) {
    throw new Error('Incorrect 2FA secret length');
  }

  return decodeBase32(secret.replace(/\W+/g, '').toLocaleUpperCase());
}

export function encodeBin(bin: Buffer) {
  if (bin.length !== 20) {
    throw new Error('Incorrect 2FA secret length');
  }

  return encodeBase32(bin).toString('utf8');
}

export function generate2FASecret(account?: string) {
  const bin = Buffer.from(WordArray.random(20).toString(), 'hex');
  const secret = encodeBin(bin);
  const appName = !!process.env.APP_NAME && process.env.APP_NAME !== 'undefined' ? process.env.APP_NAME : undefined;

  const uri = new URL(account ? `otpauth://totp/${appName}:${account}` : `otpauth://totp/${appName}`);
  uri.searchParams.append('secret', secret);
  uri.searchParams.append('digits', '6');

  if (appName) {
    uri.searchParams.append('issuer', appName);
  }

  const qr = new URL('chart', 'https://chart.googleapis.com');
  qr.searchParams.append('cht', 'qr');
  qr.searchParams.append('chs', '166x166');
  qr.searchParams.append('chld', 'L|0');
  qr.searchParams.append('chl', uri.href);

  return {
    bin,
    qr,
    secret,
    uri,
  };
}

export function generate2FAPasscode(secret: string | Buffer, config?: Partial<TOTPGenerateConfig>) {
  const bin = Buffer.isBuffer(secret) ? secret : decodeSecret(secret);

  return generateTOTP(bin, config);
}

export function verify2FAPasscode(secret: string | Buffer, token: string, config: Partial<TOTPVerifyConfig> = {}) {
  const bin = Buffer.isBuffer(secret) ? secret : decodeSecret(secret);

  return verifyTOTP(bin, token, { window: 4, ...config });
}
