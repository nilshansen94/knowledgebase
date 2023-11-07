import * as bcrypt from 'bcrypt';
import {SALT_ROUNDS} from "./constants";

export async function secretForDbAndCookie(userAgent: string, salt: string): Promise<{secretForCookie: string, secretForDb: string}> {
  const secret = await bcrypt.genSalt();
  return {
    secretForCookie: secret,
    secretForDb: await bcrypt.hash(secret + userAgent + salt, SALT_ROUNDS)
  }
}
