import { getKeyPair } from '@apptoolkit/rsa';

import { SignJWT, jwtVerify } from 'jose';

export type JWTPayload = {
  auth: boolean;
  email: string;
  is2FAEnabled: boolean;
};

export async function signJWT(payload: JWTPayload, expirationTime = '90d'): Promise<string> {
  const { privateKey } = await getKeyPair();

  const jwt = new SignJWT(payload).setProtectedHeader({ alg: 'RS256' }).setIssuedAt().setExpirationTime(expirationTime);

  if (process.env.APP_NAME) {
    jwt.setIssuer(process.env.APP_NAME);
  }

  return jwt.sign(privateKey);
}

export async function verifyJWT(jwt: string): Promise<JWTPayload> {
  const { publicKey } = await getKeyPair();

  const { payload } = await jwtVerify(jwt, publicKey, process.env.APP_NAME ? { issuer: process.env.APP_NAME } : {});

  return payload as JWTPayload;
}
