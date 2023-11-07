import {LoginRequest} from "../api/";
import * as bcrypt from 'bcrypt';
import {SALT_ROUNDS} from '@kb-rest/shared';

/**
 * Prepare a login request before sending it over http(s)
 * Hashes the password with bcrypt
 */
export async function prepareLogin(loginRequest: LoginRequest): Promise<LoginRequest> {
  const hashed = await bcrypt.hash(loginRequest.password, SALT_ROUNDS);
  return {
    user: loginRequest.user,
    password: hashed
  };
}
