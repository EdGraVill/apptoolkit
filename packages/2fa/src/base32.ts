import { Buffer } from 'buffer';

const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const valueToCharCode = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
  valueToCharCode[i] = charTable.charCodeAt(i);
}

const charToValue = new Uint8Array(256);
charToValue.fill(255); // 255 indica carácter inválido

for (let i = 0; i < 32; i++) {
  const charCode = charTable.charCodeAt(i);
  charToValue[charCode] = i;
  // Mapear letras minúsculas también
  if (charCode >= 0x41 && charCode <= 0x5a) {
    // 'A'-'Z'
    charToValue[charCode + 0x20] = i; // Mapear minúsculas
  }
}

export function encodeBase32(input: string | Buffer): Buffer {
  if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
    throw new TypeError('encodeBase32 solo acepta una cadena o un Buffer como parámetro');
  }
  const plain = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf-8');

  const length = plain.length;
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < length; i++) {
    value = (value << 8) | plain[i]!;
    bits += 8;

    while (bits >= 5) {
      output += charTable[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += charTable[(value << (5 - bits)) & 31];
  }

  // Añadir relleno '=' para que la longitud sea múltiplo de 8
  while (output.length % 8 !== 0) {
    output += '=';
  }

  return Buffer.from(output);
}

export function decodeBase32(input: string | Buffer): Buffer {
  if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
    throw new TypeError('decodeBase32 solo acepta una cadena o un Buffer como parámetro');
  }
  const encoded = Buffer.isBuffer(input) ? input.toString('utf-8') : input;

  const cleanInput = encoded.replace(/=+$/, '').toUpperCase(); // Eliminar relleno y convertir a mayúsculas
  const length = cleanInput.length;

  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.floor((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    const ch = cleanInput.charCodeAt(i);
    const val = charToValue[ch];

    if (val === 255) {
      throw new Error('Entrada inválida: no es una cadena codificada en Base32');
    }

    value = (value << 5) | val!;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}
