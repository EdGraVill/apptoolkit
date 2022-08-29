import { jwtVerify, SignJWT } from 'jose';
import { getKeyPair } from '../rsa/rsa';

export type JWTPayload = {
  auth: boolean;
  email: string;
  is2FAEnabled: boolean;
};

export async function signJWT(payload: JWTPayload, expirationTime = '90d'): Promise<string> {
  const { privateKey } = getKeyPair();

  const jwt = new SignJWT(payload).setProtectedHeader({ alg: 'ES256' }).setIssuedAt().setExpirationTime(expirationTime);

  if (process.env.APP_NAME) {
    jwt.setIssuer(process.env.APP_NAME);
  }

  return jwt.sign(privateKey);
}

export async function verifyJWT(jwt: string): Promise<JWTPayload> {
  const { publicKey } = getKeyPair();

  const { payload } = await jwtVerify(jwt, publicKey, { issuer: process.env.APP_NAME });

  return payload as JWTPayload;
}
