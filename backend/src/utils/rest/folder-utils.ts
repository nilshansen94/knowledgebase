import {Request, Response} from 'express';
import {promisePool} from '../db/db-config';
import {Folder} from '../../api';
import {listToTree} from '../list-to-tree';

export async function getFolders(req: Request, res: Response){
  /*
    SELECT folder.name, count(snip_id)
    FROM `usr_fold_snip`
    join folder on folder.id = usr_fold_snip.folder
    WHERE folder.user_id = ?
    group by folder
    order by folder.name;
  */
  const userParam = req.query.user as string;
  const conn = await promisePool.getConnection();
  const [rows] = await conn.query('select * from `folder` where user_id = ? order by name', [userParam ? userParam: req.session.userId]);
  conn.release();
  const tree: Folder[] = listToTree(rows as Folder[]);
  res.json(tree);
  return res;
}

export async function addFolder(req: Request, res: Response) {
  const folder = req.body;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    //userId is req.session.userId
    const [insertResult] = await conn.query('INSERT INTO folder(name, parent_id, user_id) VALUES (?,?,?)', [folder.name, folder.parent_id, userId]);
    await conn.commit();
    console.log('committed insert-folder')
    res.json({success: true});
  } catch(e) {
    console.log('rolling back insert-folder', e)
    await conn?.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function moveFolders(req: Request, res: Response) {
  const data = req.body as number[][];
  console.log('/moveFolder', data)
  //todo check userId?
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    //userId is req.session.userId
    for(const d of data){
      //console.log('UPDATE folder SET parent_id = :parent WHERE id = :id', JSON.stringify({parent: d[1], id: d[0]}));
      await conn.query('UPDATE folder SET parent_id = :parent WHERE id = :id', {parent: d[1], id: d[0]});
    }
    await conn.commit();
    console.log('committed move-folders')
    res.json({success: true});
  } catch(e) {
    console.log('rolling back move-folders', e)
    await conn?.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function renameFolder(req: Request, res: Response) {
  const folder = req.body;
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    // Ensure the folder belongs to the current user before renaming
    const [rows] = await conn.query('SELECT id FROM folder WHERE id = ? AND user_id = ?', [folder.id, userId]);
    if (!rows || (rows as any[]).length === 0) {
      throw new Error('Folder not found or unauthorized');
    }

    await conn.query('UPDATE folder SET name = ? WHERE id = ?', [folder.name, folder.id]);
    await conn.commit();
    console.log('committed rename-folder');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back rename-folder', e);
    await conn?.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function moveSnippets(req: Request, res: Response) {
  const data = req.body as number[][];
  console.log('/moveSnippets', data)
  //todo check userId?
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    for(const d of data){
      const updateResult = await conn.execute('UPDATE usr_fold_snip SET folder = :f WHERE snip_id = :s', {f: d[1], s: d[0]});
    }

    await conn.commit();
    console.log('committed move-snippets');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back move-snippets', e);
    await conn?.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function deleteFolder(req: Request, res: Response) {
  const folderId = parseInt(req.params.id);
  const userId = req.session.userId;
  const conn = await promisePool.getConnection();

  try {
    await conn.beginTransaction();

    // Ensure the folder belongs to the current user before deleting
    const [rows] = await conn.query('SELECT id FROM folder WHERE id = ? AND user_id = ?', [folderId, userId]);
    if (!rows || (rows as any[]).length === 0) {
      throw new Error('Folder not found or unauthorized');
    }

    // Check for subfolders
    const [subfolders] = await conn.query('SELECT COUNT(*) as count FROM folder WHERE parent_id = ?', [folderId]);
    if ((subfolders as any[])[0].count > 0) {
      throw new Error('Cannot delete folder that contains subfolders');
    }

    // Check for snippets
    const [snippets] = await conn.query('SELECT COUNT(*) as count FROM usr_fold_snip WHERE folder = ?', [folderId]);
    if ((snippets as any[])[0].count > 0) {
      throw new Error('Cannot delete folder that contains snippets');
    }

    // Delete the folder
    await conn.query('DELETE FROM folder WHERE id = ?', [folderId]);

    await conn.commit();
    console.log('committed delete-folder');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back delete-folder', e);
    await conn?.rollback();
    res.json({success: false, error: e.message});
  } finally {
    conn.release();
  }
  return res;
}
