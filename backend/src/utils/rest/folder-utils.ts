import {Request, Response} from 'express';
import {Folder} from '../../api';
import {listToTree} from '../list-to-tree';
import {deleteFrom, getTransaction, insert, select, update} from '../db/db-config';

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
  const rows = await select('select * from folder where user_id = $id order by name', {id: userParam ? userParam: req.session.userId});
  const tree: Folder[] = listToTree(rows as Folder[]);
  res.json(tree);
  return res;
}

export async function addFolder(req: Request, res: Response) {
  const folder = req.body;
  const userId = req.session.userId;
  const trx = await getTransaction();
  try {
    //userId is req.session.userId
    const insertResult = await insert('INSERT INTO folder(name, parent_id, user_id) VALUES ($1,$2,$3)', [folder.name, folder.parent_id, userId], trx);
    await trx.commit();
    console.log('committed insert-folder')
    res.json({success: true});
  } catch(e) {
    console.log('rolling back insert-folder', e)
    await trx.rollback();
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
  const trx = await getTransaction();
  try {
    //userId is req.session.userId
    for(const d of data){
      //console.log('UPDATE folder SET parent_id = :parent WHERE id = :id', JSON.stringify({parent: d[1], id: d[0]}));
      await update('UPDATE folder SET parent_id = $parent WHERE id = $id', {parent: d[1], id: d[0]}, trx);
    }
    await trx.commit();
    console.log('committed move-folders')
    res.json({success: true});
  } catch(e) {
    console.log('rolling back move-folders', e)
    await trx.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function renameFolder(req: Request, res: Response) {
  const folder = req.body;
  const userId = req.session.userId;
  const trx = await getTransaction();
  try {
    // Ensure the folder belongs to the current user before renaming
    const rows = await select('SELECT id FROM folder WHERE id = $1 AND user_id = $2', [folder.id, userId], trx);
    if (!rows || (rows as any[]).length === 0) {
      throw new Error('Folder not found or unauthorized');
    }

    await update('UPDATE folder SET name = $1 WHERE id = $2', [folder.name, folder.id], trx);
    await trx.commit();
    console.log('committed rename-folder');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back rename-folder', e);
    await trx?.rollback();
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
  const trx = await getTransaction();
  try {
    for(const d of data){
      const updateResult = await update('UPDATE usr_fold_snip SET folder = $f WHERE snip_id = $s', {f: d[1], s: d[0]}, trx);
    }

    await trx.commit();
    console.log('committed move-snippets');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back move-snippets', e);
    await trx?.rollback();
    res.json({success: false});
  }
  res.end();
  return res;
}

export async function deleteFolder(req: Request, res: Response) {
  const folderId = parseInt(req.params.id);
  const userId = req.session.userId;
  const trx = await getTransaction();

  try {
    // Ensure the folder belongs to the current user before deleting
    const rows = await select('SELECT id FROM folder WHERE id = $1 AND user_id = $2', [folderId, userId], trx);
    if (!rows || (rows as any[]).length === 0) {
      throw new Error('Folder not found or unauthorized');
    }

    // Check for subfolders
    const subfolders = await select('SELECT COUNT(*) as count FROM folder WHERE parent_id = $1', [folderId], trx);
    if ((subfolders as any[])[0].count > 0) {
      throw new Error('Cannot delete folder that contains subfolders');
    }

    // Check for snippets
    const snippets = await select('SELECT COUNT(*) as count FROM usr_fold_snip WHERE folder = $1', [folderId], trx);
    if ((snippets as any[])[0].count > 0) {
      throw new Error('Cannot delete folder that contains snippets');
    }

    // Delete the folder
    await deleteFrom('DELETE FROM folder WHERE id = $1', [folderId], trx);

    await trx.commit();
    console.log('committed delete-folder');
    res.json({success: true});
  } catch(e) {
    console.log('rolling back delete-folder', e);
    await trx?.rollback();
    res.json({success: false, error: e.message});
  } finally {
    //conn.release();
  }
  return res;
}
