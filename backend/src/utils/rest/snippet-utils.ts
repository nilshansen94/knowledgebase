import {listToTree} from '../list-to-tree';
import {Folder} from '../../api';
import {getSubFolders} from '../get-sub-folders';
import {buildSelectSnippetQuery} from '../build-query/build-query';
import {Request, Response} from 'express';
import {SnippetPinRequest} from '@kb-rest/shared';
import {promisePool} from '../db/db-config';

export async function getSnippets(req: Request, res: Response) {
  const loggedInUserId = +req.session.userId;
  const userParam = +req.query.user;
  const conn = await promisePool.getConnection();
  //console.log('get snippets for user', userId, 'and folder', req.params.folderId)
  //https://stackoverflow.com/questions/53945089/nodejs-await-async-with-nested-mysql-query
  const [rows] = await conn.query('select * from `folder` where user_id = ?', [userParam ? userParam: loggedInUserId]);
  //console.log('folders from query', rows)
  const tree = listToTree(rows as Folder[]);
  //console.log('tree',tree)
  const searchParam = req.query.search as string;
  const folderId = +req.params.folderId;
  let folderIds = [];
  if (folderId) {
    folderIds = getSubFolders(tree, +folderId);
    //console.log('folderIds',folderIds)
  }
  const page = +(req.query.page || 0);
  const query = buildSelectSnippetQuery(searchParam, folderId, userParam, page);

  //console.log(query.replace(/:search/g, `"${searchParam}"`).replace(/:userId/g, userId).replace(/:folderIds/g, folderIds.join(',')));
  const [rows2] = await conn.query(query, {search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId});
  //console.log(query);
  //console.log({search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId});

  //console.log('buildQuery:', searchParam, folderId, userParam);
  //console.log('sql params', {search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId})
  //@ts-ignore
  //console.log(`get snippets (folderId ${folderId}) (folderIds ${JSON.stringify(folderIds)}) (search ${searchParam}). Found ${rows?.length} rows`)
  conn.release();
  res.json(rows2);
  res.end();
  return res;
}

export async function addSnippet(req: Request, res: Response) {
  const snippet = req.body;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    //userId is req.session.userId
    const [insertResult] = await conn.query('INSERT INTO snippet (title, content, user_id, public) VALUES (?,?,?, ?)', [snippet.title, snippet.content, userId, snippet.public]);
    // @ts-ignore
    const snippetId = insertResult.insertId;
    const insert2 = await conn.query('INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES (?,?,?)', [userId, snippetId, snippet.folder]);
    await conn.commit();
    console.log('committed insert-snip')
    res.json({success: true});
    res.end();
  } catch(e) {
    console.log('rolling back insert-snip', e)
    await conn?.rollback();
    res.json({success: false});
    res.end();
  }
  return res;
}

export async function updateSnippet(req: Request, res: Response) {
  //todo check user_id?
  const snippet = req.body;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    //userId is req.session.userId
    const [result] = await conn.query('UPDATE snippet SET title = ?, content = ?, public = ? WHERE id = ?', [snippet.title, snippet.content, snippet.public, snippet.id]);
    // @ts-ignore
    console.log(result);
    await conn.commit();
    console.log('committed update-snip')
    // @ts-ignore
    res.json({success: result?.affectedRows === 1});
    res.end();
    return;
  } catch(e) {
    console.log('rolling back update-snip', e)
    await conn?.rollback();
    res.json({success: false});
    res.end();
    return;
  }
}

export async function toggleSnippetPublic(req: Request, res: Response){
  const snippet = req.body;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query('UPDATE snippet SET public = ? WHERE id = ?', [!snippet.public, snippet.id]);
    await conn.commit();
    console.log('committed snippet-public')
    // @ts-ignore
    const out = {success: result?.affectedRows === 1};
    res.json(out);
  } catch(e) {
    console.log('rolling back snippet-public', e)
    await conn?.rollback();
    const out = {success: false};
    res.json(out);
  }
  conn.release();
  res.end();
  return res;
}

export async function pinSnippet(req: Request, res: Response) {
  const request = req.body as SnippetPinRequest;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    let result;
    if(request.remove) {
      const query = 'DELETE FROM usr_fold_snip WHERE user_id = :user_id and snip_id = :snip_id and folder = :folder';
      [result] = await conn.query(query, {user_id: userId, snip_id: request.snippetId, folder: request.folder});
      //console.log('/snippet-pin unpinning snippet', JSON.stringify({user_id: userId, snip_id: request.snippetId, folder: request.folder}))
      //console.log(query);
    } else {
      const query = 'INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES (:user_id, :snip_id, :folder)';
      [result] = await conn.query(query, {user_id: userId, snip_id: request.snippetId, folder: request.folder});
      //console.log('/snippet-pin pinning snippet', JSON.stringify({user_id: userId, snip_id: request.snippetId, folder: request.folder}))
      //console.log(query);
    }
    await conn.commit();
    const out = {success: result?.affectedRows === 1};
    res.json(out);
    res.end();
    return res;
  } catch(e) {
    console.log('rolling back snippet-pin', e)
    await conn?.rollback();
    const out = {success: false};
    res.json(out);
    res.end();
    return res;
  }
}

export async function deleteSnippet(req: Request, res: Response) {
  //todo check userId?
  const snippetId = req.params.id;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    //userId is req.session.userId
    const [result] = await conn.query('DELETE FROM snippet WHERE id = ?', [snippetId]);
    //todo add delete cascade
    const [result2] = await conn.query('DELETE FROM usr_fold_snip WHERE snip_id = ?', [snippetId]);
    // @ts-ignore
    console.log(result);
    await conn.commit();
    console.log('committed delete-snip')
    // @ts-ignore
    res.json({success: result?.affectedRows === 1});
    res.end();
    return res;
  } catch(e) {
    console.log('rolling back delete-snip', e)
    await conn?.rollback();
    res.json({success: false});
    res.end();
    return res;
  }
}
