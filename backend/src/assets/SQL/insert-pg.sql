insert into "user" (name) values ('nils'), ('other_user');

insert into snippet (id, title, user_id, public) values
(0, 'Akros-snip',0, false),
(1, 'Akros-snip2',0, false),
(3, 'A-snip2',0, false),
(4, 'snip-other-user',1, false),
(2, 'A-snip',0, false);

insert into folder (name, parent_id, user_id) values
('Akros', null, 1),
('SQL', null, 1),
('PSQL', 2, 1),
('A', 3, 1),
('B', 3, 1),
('Mysql', null, 1),
('Misc', null, 1),
('other_user', null, 2);
