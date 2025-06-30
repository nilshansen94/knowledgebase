import {listToTree} from '../list-to-tree';
import {Folder} from '../../api';
import {getSubFolders} from '../get-sub-folders';
import {Request, Response} from 'express';
import {SnippetPinRequest} from '@kb-rest/shared';
import {deleteFrom, getTransaction, insert, select, seqCreateTables} from '../db/db-config';
import {KbUser, Snippet, UsrFoldSnip} from '../db/db-models';
import {buildSelectSnippetQueryPostgres} from '../build-query/build-query-pg';


async function testSequelize() {
  await seqCreateTables();
  const res = await select('select id, name from kb_user');
  console.log(res);
  const name = 'seq';
  const email = 'a@b.c';
  const newUser = new KbUser({name, email});
  await newUser.save();
  console.log(newUser)
  const deleted = await deleteFrom(`delete from kb_user where name = $name`,
    {name: 'seq'});
  console.log(deleted);
}

export async function getSnippets(req: Request, res: Response) {
  // await testSequelize();
  const loggedInUserId = +req.session.userId;
  const userParam = +req.query.user;
  //console.log('get snippets for user', userId, 'and folder', req.params.folderId)
  //https://stackoverflow.com/questions/53945089/nodejs-await-async-with-nested-mysql-query
  const rows = await select('select * from folder where user_id = $1', [userParam ? userParam: loggedInUserId]);
  //console.log('folders from query', rows)
  const tree = listToTree(rows as Folder[]);
  //console.log('tree',tree)
  const searchParam = req.query.search as string;
  const folderId: number = +req.params.folderId;
  let folderIds: number[] = [];
  if (folderId) {
    folderIds = getSubFolders(tree, +folderId);
    //console.log('folderIds',folderIds)
  }
  const page = +(req.query.page || 0);
  //const query = buildSelectSnippetQuery(searchParam, folderId, userParam, page);
  const query = buildSelectSnippetQueryPostgres(searchParam, folderId, userParam, page);

  //console.log(query.replace(/:search/g, `"${searchParam}"`).replace(/:userId/g, loggedInUserId.toString()).replace(/:folderIds/g, folderIds.join(',')).replace(/:userParam/g, userParam.toString()));
  //console.log(query.replace(/\$search/g, `'${searchParam}'`).replace(/\$userId/g, loggedInUserId.toString()).replace(/\$folderIds/g, folderIds.join(',')).replace(/\$userParam/g, userParam.toString()));
  //console.log(JSON.stringify({search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId}));
  const rows2 = await select(query, {search: searchParam, folderIds: searchParam ? folderIds.join(','): folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId});
  //console.log(query);
  //console.log({search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId});

  //console.log('buildQuery:', searchParam, folderId, userParam);
  //console.log('sql params', {search: searchParam, folderIds: searchParam ? folderIds: folderId, userId: loggedInUserId, userParam: userParam ? userParam: loggedInUserId})
  //@ts-ignore
  //console.log(`get snippets (folderId ${folderId}) (folderIds ${JSON.stringify(folderIds)}) (search ${searchParam}). Found ${rows?.length} rows`)
  res.json(rows2);
  res.end();
  return res;
}

export async function addSnippet(req: Request, res: Response) {
  const snippet = req.body;
  const userId = req.session.userId;
  // const conn = await getClient();
  const trx = await getTransaction();
  try {
    //await conn.beginTransaction();
    //userId is req.session.userId
    //const [insertResult] = await conn.query('INSERT INTO snippet (title, content, user_id, public) VALUES (?,?,?, ?)', [snippet.title, snippet.content, userId, snippet.public]);
    const newSnip = new Snippet({title: snippet.title, content: snippet.content, user_id: userId, public: snippet.public});
    const r = await newSnip.save({transaction: trx});
    //console.log('insert snip res', r)
    //console.log('saving snippet', JSON.stringify(newSnip))
    // @ts-ignore
    //const snippetId = insertResult.insertId;
    const newUsrFoldSnip = new UsrFoldSnip({user_id: userId, snip_id: newSnip.id, folder: snippet.folder});
    const r2 = await newUsrFoldSnip.save({transaction: trx});
    //console.log('insert usr_fold_snip res', r2);
    //const resIns = await insert('INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES ($1,$2,$3)', [userId, newSnip.id, snippet.folder], trx);
    //console.log('inserted into usr_fold_snip', [userId, newSnip.id, snippet.folder], resIns);
    await trx.commit();
    console.log('committed insert-snip')
    res.json({success: true});
    res.end();
  } catch(e) {
    console.log('rolling back insert-snip', e)
    await trx?.rollback();
    res.json({success: false});
    res.end();
  }
  return res;
}

export async function updateSnippet(req: Request, res: Response) {
  //todo check user_id?
  const snippet = req.body;
  const userId = req.session.userId;
  try {
    //userId is req.session.userId
    const snip = await Snippet.findByPk(snippet.id);
    const updateResult = await snip.update({title: snippet.title, content: snippet.content, public: snippet.public});
    console.log('committed update-snip')
    // @ts-ignore
    res.json({success: updateResult.dataValues.length === 1});
    res.end();
    return;
  } catch(e) {
    console.log('could not update snippet', e)
    res.json({success: false});
    res.end();
    return;
  }
}

export async function toggleSnippetPublic(req: Request, res: Response){
  const snippet = req.body;
  try {
    const snip = await Snippet.findByPk(snippet.id);
    await snip.update({public: !snippet.public});
    console.log('committed snippet-public');
    // todo get affected rows
    const out = {success: true};
    res.json(out);
  } catch(e) {
    console.log('could not toggle snippet-public', e)
    const out = {success: false};
    res.json(out);
  }
  res.end();
  return res;
}

export async function pinSnippet(req: Request, res: Response) {
  const request = req.body as SnippetPinRequest;
  const userId = req.session.userId;
  const trx = await getTransaction();
  try {
    let result;
    if(request.remove) {
      const query = 'DELETE FROM usr_fold_snip WHERE user_id = $user_id and snip_id = $snip_id and folder = $folder';
      result = await deleteFrom(query, {user_id: userId, snip_id: request.snippetId, folder: request.folder}, trx);
      //console.log('/snippet-pin unpinning snippet', JSON.stringify({user_id: userId, snip_id: request.snippetId, folder: request.folder}))
      //console.log(query);
    } else {
      const query = 'INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES ($user_id, $snip_id, $folder)';
      result = await insert(query, {user_id: userId, snip_id: request.snippetId, folder: request.folder}, trx);
      //console.log('/snippet-pin pinning snippet', JSON.stringify({user_id: userId, snip_id: request.snippetId, folder: request.folder}))
      //console.log(query);
    }
    await trx.commit();
    // todo affected rows
    const out = {success: true};
    res.json(out);
    res.end();
    return res;
  } catch(e) {
    console.log('could not (un)pin snippet', e)
    await trx.rollback();
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
  const trx = await getTransaction();
  try {
    //userId is req.session.userId
    const result = await deleteFrom('DELETE FROM snippet WHERE id = $1', [snippetId], trx);
    //todo add delete cascade
    const result2 = await deleteFrom('DELETE FROM usr_fold_snip WHERE snip_id = $1', [snippetId], trx);
    // @ts-ignore
    console.log(result);
    await trx.commit();
    console.log('committed delete-snip')
    // @ts-ignore
    //todo affected rows
    res.json({success: true});
    res.end();
    return res;
  } catch(e) {
    console.log('rolling back delete-snip', e);
    await trx.rollback();
    res.json({success: false});
    res.end();
    return res;
  }
}
