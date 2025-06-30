import {PAGE_SIZE} from '@kb-rest/shared';

export const buildSelectSnippetQueryPostgres = (
  searchParam: string,
  folderId: number|string,
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
       kb_user.name as user_name,
       CASE WHEN snippet.user_id = $userId THEN true ELSE false END as is_own_snippet,
       CASE WHEN snippet.user_id <> usr_fold_snip.user_id THEN true ELSE false END as is_pinned`;
  let selectMatch = `
      ,CASE
      WHEN to_tsvector(title || ' ' || content) @@ to_tsquery($search) THEN true ELSE false
    END as r1,
       CASE
      WHEN to_tsvector(title) @@ to_tsquery($search) THEN true
      ELSE false
    END as r2
       `;
  const from = `from usr_fold_snip
         join folder on folder.id = usr_fold_snip.folder
         join snippet on snippet.id = usr_fold_snip.snip_id
         join kb_user on kb_user.id = snippet.user_id`;
  const where = `WHERE 1 = 1
      and usr_fold_snip.user_id = $userParam`;
  let whereFolder = `AND usr_fold_snip.folder = any(string_to_array($folderIds, ','))`;
  //@ts-ignore
  if(!isNaN(folderId)){
    whereFolder = `AND usr_fold_snip.folder = $folderIds`;
  }
  let wherePublic = `AND snippet.public IS TRUE`;
  let whereMatch = `and to_tsvector(title || ' ' || content) @@ to_tsquery($search)`;
  let orderBy = 'ORDER BY r1 DESC, r2 DESC';
  let withCteEnd = ')';
  let selectUnion = `select * from cte
        union
        select snippet.*, -1 as folder, -1 as ufs_user, kb_user.name as user_name, false as is_own_snippet,
               EXISTS (SELECT true FROM usr_fold_snip ufs WHERE ufs.snip_id = snippet.id AND ufs.user_id = $userId) as is_pinned`;
  let selectUnionMatch = ', false as r1, false as r2';
  let unionFromWhere = `from snippet
      join kb_user on kb_user.id = snippet.user_id
      where snippet.user_id <> $userParam
      and to_tsvector(title || ' ' || content) @@ to_tsquery($search)
      and snippet.public IS TRUE
      and snippet.id not in (select id from cte)`;
  let unionCommunityWithoutOwnSnippets = `and snippet.user_id <> $userId`;

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
  //@ts-ignore
  if(isNaN(folderId)){
    whereFolder = '';
  }
  if(!userParam){
    wherePublic = '';
    unionCommunityWithoutOwnSnippets = '';//not really necessary
  }
  const limit = `LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}`;
  return [withCteStart, select, selectMatch, from, where,
    whereFolder, wherePublic, whereMatch, orderBy, withCteEnd,
    selectUnion, selectUnionMatch, unionFromWhere, unionCommunityWithoutOwnSnippets, limit].join(' ');
}
