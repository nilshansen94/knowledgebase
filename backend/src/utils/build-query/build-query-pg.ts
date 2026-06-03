import {PAGE_SIZE} from '@kb-rest/shared';

export const buildSelectSnippetQueryPostgres = (
  searchParam: string,
  folderId: number | string,
  userParam: number,
  page = 0
) => {
  //console.log('searchParam, folderId, userParam', searchParam, folderId, userParam);

  let withCteStart = 'with cte as (';
  const select = `select snippet.*,
       usr_fold_snip.folder,
       usr_fold_snip.user_id                 as ufs_user,
       original_user.name as user_name,
       original_folder.id as original_folder_id,
       original_folder.name as original_folder_name,
       folder.name as folder_name,
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
         join kb_user on usr_fold_snip.user_id = kb_user.id
         join snippet on snippet.id = usr_fold_snip.snip_id
         join kb_user as original_user on original_user.id = snippet.user_id

          left join lateral (
  select original_folder.id, original_folder.name
  from usr_fold_snip ufs2
         join folder as original_folder on original_folder.id = ufs2.folder
  where ufs2.user_id = snippet.user_id
    and ufs2.snip_id = snippet.id
  limit 1
  ) original_folder on true`;
  const where = `WHERE 1 = 1
      and usr_fold_snip.user_id = $userParam`;
  let whereFolder = `AND usr_fold_snip.folder = any(string_to_array($folderIds, ',')::int[])`;
  if (!searchParam) {
    whereFolder = `AND usr_fold_snip.folder = $folderIds`;
  }
  let wherePublic = `AND snippet.public IS TRUE`;
  let whereMatch = `and to_tsvector(title || ' ' || content) @@ to_tsquery($search)`;
  let orderBy = 'ORDER BY r1 DESC, r2 DESC';
  let withCteEnd = ')';
  let selectUnion = `select * from cte
        union
        select snippet.*, -1 as folder, -1 as ufs_user, kb_user.name as user_name, folder.id as original_folder_id, folder.name as folder_name, NULL as original_folder_name, false as is_own_snippet,
               EXISTS (SELECT true FROM usr_fold_snip ufs WHERE ufs.snip_id = snippet.id AND ufs.user_id = $userId) as is_pinned`;
  let selectUnionMatch = ', false as r1, false as r2';
  let unionFromWhere = `from snippet
      join kb_user on kb_user.id = snippet.user_id
      join usr_fold_snip on usr_fold_snip.snip_id = snippet.id
      join folder on usr_fold_snip.folder = folder.id
      where snippet.user_id <> $userParam
      and to_tsvector(title || ' ' || content) @@ to_tsquery($search)
      and snippet.public IS TRUE
      and snippet.id not in (select id from cte)`;
  let unionCommunityWithoutOwnSnippets = `and snippet.user_id <> $userId`;

  if (!searchParam) {
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
  if (isNaN(folderId as number)) {
    whereFolder = '';
  }
  if (!userParam) {
    wherePublic = '';
    unionCommunityWithoutOwnSnippets = '';//not really necessary
  }
  const limit = `LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}`;
  return [withCteStart, select, selectMatch, from, where,
    whereFolder, wherePublic, whereMatch, orderBy, withCteEnd,
    selectUnion, selectUnionMatch, unionFromWhere, unionCommunityWithoutOwnSnippets, limit].join(' ');
}
