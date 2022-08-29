/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

declare module 'thirty-two' {
  export function encode(value: string | Buffer): Buffer;
  export function decode(encoded: string | Buffer): Buffer;
}
