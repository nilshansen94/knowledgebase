CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL
);

CREATE TABLE snippet (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  content TEXT,
  user_id INTEGER,
  public BOOLEAN
);

CREATE INDEX snip_title_content_index ON snippet USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX snip_title_index ON snippet USING gin(to_tsvector('english', title));

CREATE TABLE folder (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  parent_id INTEGER,
  user_id INTEGER
);

CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  snip_id INTEGER,
  time TIMESTAMP,
  comment TEXT
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200)
);

CREATE TABLE snip_tag (
  snip_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (snip_id, tag_id)
);

CREATE TABLE usr_fold_snip (
  user_id INTEGER NOT NULL,
  snip_id INTEGER NOT NULL,
  folder INTEGER DEFAULT NULL,
  PRIMARY KEY (user_id, snip_id)
);
