import {PAGE_SIZE} from '@kb-rest/shared';

export const buildSelectSnippetQuery = (
  searchParam: string,
  folderId: number,
  userParam: number,
  page: number = 0
) => {
  //console.log('searchParam, folderId, userParam', searchParam, folderId, userParam);
  /*
  Todo Konzept ändern:
  (Ordnerstruktur: man ist sich gewöhnt, dass man nicht die Snippets von Subfolders im Parent sieht.)
  (Aber man ist sich gewöhnt, dass man beim Suchen auch in die Subfolders geht.)
   Wenn ich in Folder bin und suche, dann sollte ich die Suche von anderen Snippets vermutlich separat machen und anzeigen. (ja)
   Aber: dann kann ich nicht die relevanten nach oben nehmen. (jein, man sieht was extern ist und was vom folder)
   Wenn ich pinnen will, muss ich vermutlich ein modal aufmachen mit den Folders
   */

  let withCteStart = 'with cte as (';
  let select = `select snippet.*,
       usr_fold_snip.folder,
       usr_fold_snip.user_id                 as ufs_user,
       user.name as user_name,
       if(snippet.user_id = :userId, 1, 0)         as isOwnSnippet,
       if(snippet.user_id <> usr_fold_snip.user_id, 1, 0)  as isPinned`;
  let selectMatch = `,match(title, content) against(:search) as r1,
       match(title) against(:search)          as r2`;
  const from = `from usr_fold_snip
         join user on user.id = usr_fold_snip.user_id
         join folder on folder.id = usr_fold_snip.folder
         join snippet on snippet.id = usr_fold_snip.snip_id`;
  const where = `WHERE 1 = 1
      and usr_fold_snip.user_id = :userParam`;
  let whereFolder = `AND usr_fold_snip.folder in (:folderIds)`;
  let wherePublic = `AND snippet.public IS TRUE`;
  let whereMatch = `and match(title, content) against(:search IN NATURAL LANGUAGE MODE)`;
  let orderBy = 'ORDER BY r1 DESC, r2 DESC';
  let withCteEnd = ')';
  let selectUnion = `select * from cte
        union
        select snippet.*, -1 as folder, -1 as ufs_user, user.name as user_name, 0 as isOwnSnippet,
               EXISTS (SELECT 1 FROM usr_fold_snip ufs WHERE ufs.snip_id = snippet.id AND ufs.user_id = :userId) as isPinned`;
  let selectUnionMatch = ', -1 as r1, -1 as r2';
  let unionFromWhere = `from snippet
      join user on user.id = snippet.user_id
      where snippet.user_id <> :userParam
      and match(title, content) against(:search IN NATURAL LANGUAGE MODE)
      and snippet.public IS TRUE
      and snippet.id not in (select id from cte)`;
  let unionCommunityWithoutOwnSnippets = `and snippet.user_id <> :userId`;

  if(!searchParam){
    withCteStart = '';
    withCteEnd = '';
    selectMatch = '';
    whereMatch = '';
    orderBy = 'ORDER BY snippet.title ASC';
    selectUnion = '';
    selectUnionMatch = '';
    unionFromWhere = '';
    unionCommunityWithoutOwnSnippets = '';//not really necessary
  }
  if(isNaN(folderId)){
    whereFolder = '';
  }
  if(!userParam){
    wherePublic = '';
    unionCommunityWithoutOwnSnippets = '';//not really necessary
  }
  const limit = `LIMIT ${page * PAGE_SIZE}, ${PAGE_SIZE}`;
  return [withCteStart, select, selectMatch, from, where,
    whereFolder, wherePublic, whereMatch, orderBy, withCteEnd,
    selectUnion, selectUnionMatch, unionFromWhere, unionCommunityWithoutOwnSnippets, limit].join(' ');
}
