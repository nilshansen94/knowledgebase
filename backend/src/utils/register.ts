import {LoginRequest, SALT_ROUNDS} from "@kb-rest/shared";
import * as bcrypt from 'bcrypt';
import {PoolConnection} from "mysql2/promise";

export async function register(request: LoginRequest, conn: PoolConnection) {
  const insert = 'INSERT INTO user (name, password, salt) VALUES (?,?,?)';
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const pw = await bcrypt.hash(salt + request.password, SALT_ROUNDS);
  const [insertResult] = await conn.query(insert, [request.user, pw, salt]);
  // @ts-ignore
  return insertResult.insertId;
}
