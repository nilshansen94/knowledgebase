WITH cte AS (
  SELECT
    snippet.*,
    usr_fold_snip.folder,
    usr_fold_snip.user_id AS ufs_user,
    "user".name AS user_name,
    CASE WHEN snippet.user_id = 8 THEN 1 ELSE 0 END AS is_own_snippet,
    CASE WHEN snippet.user_id <> usr_fold_snip.user_id THEN 1 ELSE 0 END AS is_pinned,
    CASE WHEN to_tsvector(title || ' ' || content) @@ to_tsquery('apply') THEN 1 ELSE 0 END AS r1, -- Placeholder: needs proper to_tsvector/to_tsquery setup
    CASE WHEN to_tsvector(title) @@ to_tsquery('apply') THEN 1 ELSE 0 END AS r2 -- Placeholder: needs proper to_tsvector/to_tsquery setup
  FROM usr_fold_snip
  JOIN folder ON folder.id = usr_fold_snip.folder
  JOIN snippet ON snippet.id = usr_fold_snip.snip_id
  JOIN "user" ON "user".id = snippet.user_id
  WHERE 1 = 1
    AND usr_fold_snip.user_id = 8
    AND usr_fold_snip.folder IN (10)
    AND to_tsvector(title || ' ' || content) @@ to_tsquery('apply') -- Placeholder: needs proper to_tsvector/to_tsquery setup
  ORDER BY r1 DESC, r2 DESC
)
SELECT *
FROM cte
UNION
SELECT
  snippet.*,
  -1 AS folder,
  -1 AS ufs_user,
  "user".name AS user_name,
  0 AS is_own_snippet,
  EXISTS (
    SELECT FROM usr_fold_snip ufs
    WHERE
      ufs.snip_id = snippet.id AND ufs.user_id = 8
  ) AS is_pinned,
  -1 AS r1,
  -1 AS r2
FROM snippet
JOIN "user" ON "user".id = snippet.user_id
WHERE
  snippet.user_id <> -1
  AND to_tsvector(title || ' ' || content) @@ to_tsquery('apply') -- Placeholder: needs proper to_tsvector/to_tsquery setup
  AND snippet.public IS true
  AND snippet.id NOT IN (
    SELECT id
    FROM cte
  )
LIMIT 20 OFFSET 0

