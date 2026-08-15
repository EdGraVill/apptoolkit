/* eslint-disable @typescript-eslint/no-non-null-assertion */
import createHmacSha1 from 'crypto-js/hmac-sha1';
import WordArray from 'crypto-js/lib-typedarrays';

export function hexToBytes(hex: string) {
  return Uint8Array.from(hex.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || []);
}

export function intToBytes(num: number, alloc = 8): Uint8Array {
  let rest = num;

  const buffer = new Uint8Array(alloc);

  for (let index = buffer.length - 1; index >= 0 && rest > 0; index -= 1) {
    buffer[index] = rest & 255;
    rest = rest >> 8;
  }

  return buffer;
}

export interface HOTPGenerateConfig {
  tokenLength: number;
}

export function generateHOTP(key: string | ArrayLike<number>, counter = 0, config: Partial<HOTPGenerateConfig> = {}): string {
  const { tokenLength } = { ...generateHOTP.defaultConfig, ...config };

  const counterBytes = intToBytes(counter);
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : Uint8Array.from(key);
  const hmac = createHmacSha1(WordArray.create(counterBytes), WordArray.create(keyBytes));

  const digest = hmac.toString();

  const hex = hexToBytes(digest);

  const offset = hex[19]! & 0xf;

  const calc =
    ((hex[offset]! & 0x7f) << 24) |
    ((hex[offset + 1]! & 0xff) << 16) |
    ((hex[offset + 2]! & 0xff) << 8) |
    (hex[offset + 3]! & 0xff);

  const preToken = `${calc % Math.pow(10, tokenLength)}`;

  return `${Array.from({ length: tokenLength - preToken.length })
    .fill(0)
    .join('')}${preToken}`;
}
generateHOTP.defaultConfig = {
  tokenLength: 6,
} as HOTPGenerateConfig;

export interface HOTPVerifyConfig extends HOTPGenerateConfig {
  window: number;
}

export function verifyHOTP(
  key: string | ArrayLike<number>,
  token: string,
  counter = 0,
  config: Partial<HOTPVerifyConfig> = {},
): { delta: number } | null {
  const { tokenLength, window } = { ...verifyHOTP.defaultConfig, ...config };

  for (let tryCounter = Math.max(0, counter - window); tryCounter < counter + window; tryCounter += 1) {
    const calculated = generateHOTP(key, tryCounter, { tokenLength });

    if (calculated === token) {
      return { delta: tryCounter - counter };
    }
  }

  return null;
}
verifyHOTP.defaultConfig = {
  ...generateHOTP.defaultConfig,
  window: 50,
} as HOTPVerifyConfig;
