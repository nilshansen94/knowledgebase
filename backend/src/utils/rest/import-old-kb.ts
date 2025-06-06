import {promisePool} from '../db/db-config';
import {Request, Response} from 'express';

export async function importOldKb(req: Request, res: Response) {
  /*
  TODO: import missing snippets only?
    select * from knowledgebase.kb_snippets o
    where not exists (select 1 from kb_rest.snippet n where o.id=n.id);

    TODO: get lang as well
  */
  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('truncate table folder')
    await conn.query('truncate table snippet')
    await conn.query('truncate table usr_fold_snip')

    const [folders] = await conn.query('select * from knowledgebase.kb_folder') as any;
    for(const folder of folders){
      await conn.query('insert into kb_rest.folder (id, name, parent_id, user_id) values(?,?,?,?)', [folder.id, folder.name, null, 8])
      console.log('insert into kb_rest.folder (id, name, parent_id, user_id) values(?,?,?,?)', [folder.id, folder.name, null, 8])
    }

    const [rows] = await conn.query(`
        SELECT knowledgebase.kb_folder.id as folder_id,
               knowledgebase.kb_folder.name as folder_name,
               knowledgebase.kb_lang.id as lang_id,
               knowledgebase.kb_lang.name as lang_name,
               knowledgebase.kb_snippets.*
        from knowledgebase.kb_folder, knowledgebase.kb_lang, knowledgebase.kb_snippets
        WHERE kb_snippets.folder = kb_folder.id AND kb_snippets.lang = kb_lang.id
        `) as any;
    console.log(rows.length, 'rows');
    for(const row of rows){
      const code = row.code ? '\n```' + row.lang_name + '\n' + row.code + '\n```': '';
      const [insertResult] = await conn.query('insert into kb_rest.snippet (id, title, content, user_id) values(?,?,?,?)', [row.id, row.title, row.description + code, 8]) as any;
      //console.log('insert into kb_rest.snippet (id, title, content, user_id) values(?,?,?,?)', [row.id, row.title, row.description, 8])
      console.log('insert id is', insertResult.insertId);
      await conn.query('insert into usr_fold_snip (user_id, snip_id, folder) values(?,?,?)', [8, insertResult.insertId, row.folder_id])
      //console.log('insert into usr_fold_snip (user_id, snip_id, folder) values(?,?,?)', [8, insertResult.insertId, row.folder_id])
    }
    await conn?.commit();
    res.json({success: true});
    res.end()
    return res;
    //was: return 1
  } catch (e){
    console.log(e);
    await conn?.rollback();
    res.json({success: false});
    res.end()
    return res;
    //was: return 0
  }
}
