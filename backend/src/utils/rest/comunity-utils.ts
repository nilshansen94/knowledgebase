import {Request, Response} from 'express';
import {promisePool} from '../db/db-config';
import {DbUser} from '../../api';

export async function getUsers(req: Request, res: Response){
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  const [rows] = await conn.query('SELECT id, name from user WHERE id != :userId', {userId});
  conn.release();
  const users: DbUser[] = rows as DbUser[];
  res.json(users);
  res.end();
  return res;
}

export async function getUserName(req: Request, res: Response){
  const userId = req.params.id;
  const conn = await promisePool.getConnection();
  const [rows] = await conn.query('SELECT name FROM user WHERE id = :userId', {userId});
  conn.release();
  const username: {name: string} = rows[0];
  res.json(username);
  res.end();
  return res;
}

export async function getCommunitySnippets(req: Request, res: Response) {
  const searchParam = req.query.search;
  const userId = req.session.userId;

  if(!searchParam){
    res.json([]);
    res.end();
    return;
  }
  const query = `SELECT snippet.*, user.name,
       MATCH(title, content) against(:search) as r1, match(title) against(:search) as r2
       FROM usr_fold_snip
              join user on user.id = usr_fold_snip.user_id
              join folder on folder.id = usr_fold_snip.folder
              join snippet on snippet.id = usr_fold_snip.snip_id
              WHERE match(title, content) against (:search IN NATURAL LANGUAGE MODE)
              AND user.id != :user_id
              AND snippet.user_id != :user_id
              AND snippet.public IS TRUE
              ORDER BY r1 DESC, r2 DESC, snippet.title`;
  const conn = await promisePool.getConnection();
  const [rows] = await conn.query(query, {search: searchParam, user_id: userId});
  conn.release();
  res.json(rows);
  res.end();
  return res;
}
