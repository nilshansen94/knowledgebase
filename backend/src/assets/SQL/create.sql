use kb_rest;
create table `user` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200)
);

create table snippet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title varchar(500),
  content text,
  user_id int
);
CREATE FULLTEXT INDEX snip_title_content_index
  ON snippet (title, content);
CREATE FULLTEXT INDEX snip_title_index
  ON snippet (title);

create table folder (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  parent_id int,
  user_id int
);

create table comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id int,
  snip_id int,
  `time` timestamp,
  comment text
);

create table tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200)
);

create table snip_tag (
  snip_id int,
  tag_id int,
  primary key (snip_id, tag_id)
);

create table usr_fold_snip (
  user_id int,
  snip_id int,
  folders varchar(100),
  primary key (user_id, snip_id)
);
