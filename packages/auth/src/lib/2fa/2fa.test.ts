import { randomBytes } from 'crypto';
import { generate2FAPasscode, generate2FASecret, restore2FASecret, verify2FAPasscode } from './2fa';
import { generateHOTP, hexToBytes, intToBytes, verifyHOTP } from './hotp';
import { generateTOTP, verifyTOTP } from './totp';

describe('2fs.ts', () => {
  const knownBin = Buffer.from([
    0xac, 0xdc, 0x97, 0x0d, 0x07, 0x20, 0x7c, 0x10, 0xa8, 0x7b, 0x74, 0xd9, 0x67, 0x75, 0x25, 0x46, 0x41, 0xb7, 0xbe,
    0x46,
  ]);
  const knownSecret = 'VTOJODIHEB6BBKD3OTMWO5JFIZA3PPSG';

  describe('restore2FASecret', () => {
    it('Should throw an error if input is not a 20 bytes length binary', () => {
      const bin = randomBytes(21);

      expect(() => restore2FASecret(bin)).toThrowError('Incorrect 2FA secret length');
    });

    it('Should return base32 string encoded with 20 bytes length binary', () => {
      const secret = restore2FASecret(knownBin);

      expect(secret).toBe(knownSecret);
    });
  });

  describe('generate2FASecret', () => {
    it('Should return random secret along with qr, uri and the binary random bytes', () => {
      const { bin, qr, secret, uri } = generate2FASecret();

      expect(bin).toHaveLength(20);
      expect(qr).not.toBeUndefined();
      expect(secret).toBe(restore2FASecret(bin));
      expect(uri).not.toBeUndefined();
    });

    it('Shold includes the name of the account if is provided', () => {
      const accountName = 'describe@account.com';
      const { uri } = generate2FASecret(accountName);

      expect(uri.href).toContain(accountName);
    });

    it('Should includes App Name if is declared in the .env file', () => {
      const appName = (process.env.APP_NAME = 'Test');

      const { uri } = generate2FASecret();

      expect(uri.href).toContain(`issuer=${appName}`);
    });

    it('Should not includes App Name if is declared in the .env file', () => {
      process.env.APP_NAME = undefined;

      const { uri } = generate2FASecret();

      expect(uri.href).not.toContain('issuer');
    });
  });

  describe('generate2FAPasscode', () => {
    const fakeBaseDate = new Date('1995-03-15');

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(fakeBaseDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('Should generate a 6 digits passcode', () => {
      const { bin } = generate2FASecret();

      const passcode = generate2FAPasscode(bin);

      expect(passcode).toHaveLength(6);
      expect(passcode).toMatch(/\d{6}/);
    });

    it('Should always generate same 6 digits passcode in the same time', () => {
      const passcode = generate2FAPasscode(knownBin);

      expect(passcode).toBe('341583');
    });

    it('Should be able to receive a secret as string', () => {
      const passcode = generate2FAPasscode(knownSecret);

      expect(passcode).toBe('341583');
    });

    it('Should generate a new passcode every 30 seconds', () => {
      let passcode = generate2FAPasscode(knownBin);

      expect(passcode).toBe('341583');

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 30_000));
      passcode = generate2FAPasscode(knownBin);

      expect(passcode).toBe('485746');

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 60_000));
      passcode = generate2FAPasscode(knownBin);

      expect(passcode).toBe('369254');
    });
  });

  describe('verify2FAPasscode', () => {
    const fakeBaseDate = new Date('1995-03-15');

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(fakeBaseDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('Should be able to receive a secret as string', () => {
      const result = verify2FAPasscode(knownSecret, '341583');

      expect(result).toEqual({ delta: 0 });
    });

    it('Should return an object if the pass has less than 2:30 minutes', () => {
      const passcode = generate2FAPasscode(knownBin);

      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: 0 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 30_000));
      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: -1 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 60_000));
      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: -2 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 90_000));
      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: -3 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 120_000));
      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: -4 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 150_000 - 1));
      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: -4 });
    });

    it('Should return null if the pass has more than 2:30 minutes', () => {
      const passcode = generate2FAPasscode(knownBin);

      expect(verify2FAPasscode(knownBin, passcode)).toEqual({ delta: 0 });

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 150_000));
      expect(verify2FAPasscode(knownBin, passcode)).toBeNull();
    });
  });
});

const stringKey = 'abcdefghijklmnopqrstuvwxyz';
const bufferKey = Buffer.from(stringKey);

describe('hotp.ts', () => {
  describe('hexToBytes', () => {
    it('Should return a Buffer of bytes', () => {
      const hex = '2b5e9a6443dfd01db015c959b3a4e10a73d5c1f8';
      const bytes = Buffer.from([
        0x2b, 0x5e, 0x9a, 0x64, 0x43, 0xdf, 0xd0, 0x1d, 0xb0, 0x15, 0xc9, 0x59, 0xb3, 0xa4, 0xe1, 0x0a, 0x73, 0xd5,
        0xc1, 0xf8,
      ]);

      const result = hexToBytes(hex);

      expect(result).toEqual(bytes);
    });

    it('Should return an empty Buffer if empty hex is provided', () => {
      const hex = '';
      const bytes = Buffer.from([]);

      const result = hexToBytes(hex);

      expect(result).toEqual(bytes);
    });
  });

  describe('intToBytes', () => {
    it('Should return a Buffer of hex 8 bytes length', () => {
      const decimal = 1_234_567_890;
      const bytes = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x96, 0x02, 0xd2]);

      const result = intToBytes(decimal);

      expect(result).toEqual(bytes);
      expect(result).toHaveLength(8);
    });

    it('Should return a Buffer of fixed length', () => {
      const decimal = 1_234_567_890;
      const length = 2;
      const bytes = Buffer.from([0x02, 0xd2]);

      const result = intToBytes(decimal, length);

      expect(result).toEqual(bytes);
      expect(result).toHaveLength(length);
    });
  });

  const counter = 1_234_567_890;
  const code = '479309';

  describe('generate', () => {
    it('Should generate a 6 digit passcode with same key as string or buffer and counter', () => {
      const stringResult = generateHOTP(stringKey, counter);
      const bufferResult = generateHOTP(bufferKey, counter);

      expect(stringResult).toBe(code);
      expect(bufferResult).toBe(code);
    });

    it('Should generate a different 6 digit passcode with same key but different counter', () => {
      const result = generateHOTP(stringKey);
      const resultWithDifferentCounter = generateHOTP(stringKey, counter);

      expect(result).not.toBe(resultWithDifferentCounter);
    });

    it('Should generate a passcode with given tokenLength', () => {
      const tokenLength = 8;

      const result = generateHOTP(stringKey, counter, { tokenLength });
      console.log({ result });

      expect(result).toHaveLength(tokenLength);
    });
  });

  describe('verifyHOTP', () => {
    it('Should validate the given code', () => {
      const result = verifyHOTP(stringKey, code, counter);

      expect(result).toEqual({ delta: 0 });
    });

    it('Should validate the given code even if is 50 numbers far from counter', () => {
      const result = verifyHOTP(stringKey, code, counter + 50);

      expect(result).toEqual({ delta: -50 });
    });

    it('Should validate the given code even if is 100 numbers far from counter by adding that configuration', () => {
      const result = verifyHOTP(stringKey, code, counter + 100, { window: 100 });

      expect(result).toEqual({ delta: -100 });
    });

    it('Should validate the given code even with different lenght by adding that configuration', () => {
      const result = verifyHOTP(stringKey, '59479309', counter, { tokenLength: 8 });

      expect(result).toEqual({ delta: 0 });
    });

    it('Should return null if the passed if far from counter', () => {
      const result = verifyHOTP(stringKey, code);

      expect(result).toBeNull();
    });
  });
});

describe('totp.ts', () => {
  const fakeBaseDate = new Date('1995-03-15');
  const code = '607994';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fakeBaseDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('generateTOTP', () => {
    it('Should generate an unique passcode depending on time', () => {
      const result = generateTOTP(stringKey);

      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 60 * 60_000));

      const resultAfterTime = generateTOTP(stringKey);

      expect(result).not.toEqual(resultAfterTime);
    });

    it('Should generate a passcode with same key as string or buffer', () => {
      const stringResult = generateTOTP(stringKey);
      const bufferResult = generateTOTP(bufferKey);

      expect(stringResult).toBe(code);
      expect(bufferResult).toBe(code);
    });

    it('Should generate new passcode every given seconds', () => {
      const givenSeconds = 45;

      const firstResult = generateTOTP(stringKey, { time: givenSeconds });
      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + (givenSeconds - 1) * 1000));
      const secondResult = generateTOTP(stringKey, { time: givenSeconds });
      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + givenSeconds * 1000));
      const thirdResult = generateTOTP(stringKey, { time: givenSeconds });

      expect(firstResult).toBe(secondResult);
      expect(firstResult).not.toBe(thirdResult);
    });

    it('Should generate a given length passcode', () => {
      const givenLength = 8;

      const result = generateTOTP(stringKey, { tokenLength: givenLength });

      expect(result).toHaveLength(givenLength);
    });
  });

  describe('verifyTOTP', () => {
    it('Should validate the given code', () => {
      const result = verifyTOTP(stringKey, code);

      expect(result).toEqual({ delta: 0 });
    });

    it('Should validate the given code even if is 1500 seconds far from counter', () => {
      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 1500 * 1000));
      const result = verifyTOTP(stringKey, code);

      expect(result).toEqual({ delta: -50 });
    });

    it('Should validate the given code even if is 3000 numbers far from counter by adding that configuration', () => {
      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 3000 * 1000));
      const result = verifyTOTP(stringKey, code, { window: 100 });

      expect(result).toEqual({ delta: -100 });
    });

    it('Should validate the given code even with different lenght by adding that configuration', () => {
      const result = verifyTOTP(stringKey, '66607994', { tokenLength: 8 });

      expect(result).toEqual({ delta: 0 });
    });

    it('Should return null if the passed if far from counter', () => {
      jest.useFakeTimers().setSystemTime(new Date(fakeBaseDate.getTime() + 3000 * 1000));
      const result = verifyTOTP(stringKey, code);

      expect(result).toBeNull();
    });
  });
});
