import {getTransaction, select} from '../db/db-config';
import {getFolders} from './folder-utils';
import {Transaction} from 'sequelize';
import {Folder as DbFolder, Snippet as DbSnippet, UsrFoldSnip} from '../db/db-models';
import {Folder, Snippet} from '@kb-rest/shared';

export async function exportData(req, res) {
  const userId = req.session.userId;
  const folders = await getFolders(req, res);

  const query = `
  select snippet.*, folder.id as folder_id from usr_fold_snip
    join snippet on snippet.id = usr_fold_snip.snip_id
    join folder on folder.id = usr_fold_snip.folder
    where snippet.user_id = $id
  `;
  const snippets = await select(query, {id: userId});
  //todo snippet interface
  const snippetsByFolder = new Map<number, any[]>();
  //todo type for this result..
  snippets.forEach(snippet => {
    if(!snippetsByFolder.has(snippet.folder_id)){
      snippetsByFolder.set(snippet.folder_id, []);
    }
    const {folder_id, ...snippetOnly} = snippet;
    snippetsByFolder.get(snippet.folder_id).push(snippetOnly);
  });

  assignSnippetsToFolders(folders, snippetsByFolder);

  return folders;
}

export async function importData(req, res) {
  const trx = await getTransaction();
  try {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }
    const jsonData = JSON.parse(fileBuffer.toString('utf8')) as Folder[];

    const userId = +req.session.userId;
    await importDataToDb(jsonData, userId, null, trx);
    await trx.commit();

    res.json({ success: true, data: jsonData });
  } catch (e) {
    console.log('importData error', e)
    await trx.rollback();
  }
}

async function importDataToDb(folders: Folder[], userId: number, parentFolderId: number, trx: Transaction) {
  for(const folder of folders) {
    const newFolder = new DbFolder({name: folder.name, parent_id: parentFolderId, user_id: userId});
    const folderRes = await newFolder.save({transaction: trx});
    console.log('saved folder ' + JSON.stringify(folderRes));
    for(const snippet of folder.snippets) {
      const newSnip = new DbSnippet({title: snippet.title, content: snippet.content, user_id: userId, public: snippet.public});
      const snippetRes = await newSnip.save({transaction: trx});
      //console.log('saved snippet ' + JSON.stringify(snippetRes))
      const newUsrFoldSnip = new UsrFoldSnip({user_id: userId, snip_id: snippetRes.id, folder: folderRes.id});
      await newUsrFoldSnip.save({transaction: trx});
      //console.log('saved usrfoldsnip ' + JSON.stringify(newUsrFoldSnip))
    }
    if(folder.childNodes?.length > 0) {
      await importDataToDb(folder.childNodes, userId, folderRes.id, trx);
    }
  }
}

export async function getMyUsername(req, res) {
  const email = req.session.email;
  const result = await select('SELECT name from kb_user where email = $email', {email});
  res.json(result[0]);
}

function assignSnippetsToFolders(folders: Folder[], snippetsByFolder: Map<number, Snippet[]>) {
  folders.forEach(folder => {
    folder.snippets = snippetsByFolder.get(folder.id) || [];
    if (folder.childNodes && folder.childNodes.length > 0) {
      assignSnippetsToFolders(folder.childNodes, snippetsByFolder);
    }
  });
}
