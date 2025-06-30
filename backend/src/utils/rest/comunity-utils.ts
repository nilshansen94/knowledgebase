import {Request, Response} from 'express';
import {DbUser} from '../../api';
import {select} from '../db/db-config';

export async function getUsers(req: Request, res: Response){
  const userId = req.session.userId;
  const rows = await select('SELECT id, name from kb_user WHERE id != $userId', {userId});
  const users: DbUser[] = rows as DbUser[];
  res.json(users);
  res.end();
  return res;
}

export async function getUserName(req: Request, res: Response){
  const userId = req.params.id;
  const rows = await select('SELECT name FROM kb_user WHERE id = $userId', {userId});
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
  const query = `SELECT snippet.*, kb_user.name,
       MATCH(title, content) against($search) as r1, match(title) against($search) as r2
       FROM usr_fold_snip
              join kb_user on kb_user.id = usr_fold_snip.user_id
              join folder on folder.id = usr_fold_snip.folder
              join snippet on snippet.id = usr_fold_snip.snip_id
              WHERE match(title, content) against ($search IN NATURAL LANGUAGE MODE)
              AND kb_user.id != $user_id
              AND snippet.user_id != $user_id
              AND snippet.public IS TRUE
              ORDER BY r1 DESC, r2 DESC, snippet.title`;
  const rows = await select(query, {search: searchParam, user_id: userId});
  res.json(rows);
  res.end();
  return res;
}
