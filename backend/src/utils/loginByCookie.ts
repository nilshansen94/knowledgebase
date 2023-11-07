import * as bcrypt from 'bcrypt';
import {PoolConnection} from 'mysql2/promise';

export async function loginByCookie(id: number, secret: string, userAgent: string, conn: PoolConnection) {
  const query = 'SELECT secret FROM `user` WHERE id=?';
  const [result] = await conn.query(query, [id]);
  // @ts-ignore
  if(result.length !== 1) {
    return false;
  }
  // @ts-ignore
  return bcrypt.compare(secret + userAgent, result[0].secret);
}
