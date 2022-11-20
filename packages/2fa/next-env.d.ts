declare module 'thirty-two' {
  export function encode(value: string | Buffer): Buffer;
  export function decode(encoded: string | Buffer): Buffer;
}
