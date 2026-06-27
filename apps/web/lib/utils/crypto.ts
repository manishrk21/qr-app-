import { nanoid } from "nanoid";

export function createSignedToken(payload: string) {
  const nonce = nanoid(12);
  return `${payload}.${nonce}`;
}

export function verifySignedToken(token: string) {
  return token.split(".").length === 2;
}
