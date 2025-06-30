with cte as (
  select
    snippet.*,
    usr_fold_snip.folder,
    usr_fold_snip.user_id as ufs_user,
    kb_user.name as user_name,
    CASE WHEN snippet.user_id = 8 THEN true ELSE false END as is_own_snippet,
    CASE WHEN snippet.user_id <> usr_fold_snip.user_id THEN true ELSE false END as is_pinned,
    CASE
      WHEN to_tsvector(title || ' ' || content) @@ to_tsquery('apply') THEN true ELSE false
    END as r1,
    CASE
      WHEN to_tsvector(title) @@ to_tsquery('apply') THEN true
      ELSE false
    END as r2
  from
    usr_fold_snip
    join folder on folder.id = usr_fold_snip.folder
    join snippet on snippet.id = usr_fold_snip.snip_id
    join kb_user on kb_user.id = snippet.user_id
  WHERE
    1 = 1
    and usr_fold_snip.user_id = 8
    AND usr_fold_snip.folder in (10)
    and to_tsvector(title || ' ' || content) @@ to_tsquery('apply')
  ORDER BY
    r1 DESC,
    r2 DESC
)
select
  *
from
  cte
union
select
  snippet.*,
  -1 as folder,
  -1 as ufs_user,
  kb_user.name as user_name,
  false as is_own_snippet,
  EXISTS (
    SELECT
      FROM usr_fold_snip ufs
    WHERE
      ufs.snip_id = snippet.id
      AND ufs.user_id = 8
  ) as is_pinned,
  false as r1,
  false as r2
from
  snippet
  join kb_user on kb_user.id = snippet.user_id
where
  snippet.user_id <> - 1
  and to_tsvector(title || ' ' || content) @@ to_tsquery('apply')
  and snippet.public = true
  and snippet.id not in (
    select
      id
    from
      cte
  )
LIMIT
  20 OFFSET 0
