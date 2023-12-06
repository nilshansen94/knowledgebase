import {LoginRequest} from '@kb-rest/shared';
import {PoolConnection} from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import {DbUser} from '../api';

export async function loginByPw(request: LoginRequest, conn: PoolConnection) {
  const query = 'SELECT id, name, password, salt, secret FROM `user` WHERE name=?';
  const [result] = await conn.query(query, [request.user]);
  //@ts-ignore
  if(result.length !== 1){
    return {success: false};
  }
  // @ts-ignore
  const user = result[0] as DbUser;
  if (!isNaN(user.id)) {
    const success = await bcrypt.compare(user.salt + request.password, user.password);
    return {success, userId: user.id};
  }
  return {success: false};
}
