export const insertSql = `
  INSERT INTO \`user\` (\`id\`, \`name\`, \`password\`, \`salt\`, \`secret\`) VALUES
(1, 'a', '$2b$14$LBwStJTh9qKVlzZiN.xMIu/FhdjlfxKaIm3hOdCRY3dUZEN.GCiZ2', '$2b$14$pciNm2ul0q8uWnzvZePQ7u',
'$2b$14$YP6nrgwOqTmhc5QLuAzjWeI09ARjYQQRz6sRpocAP3yrnjSdPLzLe'),
(2, 'b', '$2b$14$2kiVX4/61xGyl5y8drsSHuwMGkrZ2pG0Flzh3NQOnvReXhIoBNQ4u', '$2b$14$Jlt.3fyZpr6MfBx8r/QcJ.',
'$2b$14$xQZDAwopwqx1O2MN1ZMHoObZlnqr9/X14evWGSIw8lAjHsgyYjdoa');

INSERT INTO snippet (id, title, content, user_id, public) VALUES
(1, 'A1 folder1', 'A1 folder1\nI like trees', 1, 0),
(2, 'A2 folder2', 'A2 folder2\nI like cars', 1, 1),
(3, 'B1 folder1 private', 'B1 folder1\nI like dogs', 2, 0),
(4, 'B2 folder1 public', 'B2 folder1 public\nI like cats too', 2, 1),
(5, 'B3 folder1 public', 'B3 folder1 public\nI like animals', 2, 1);

INSERT INTO folder (id, name, parent_id, user_id) VALUES
(1, 'folder-a1', NULL, 1),
(2, 'folder-a2', NULL, 1),
(3, 'folder-b1', NULL, 2);

INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 4, 1),
(2, 3, 3),
(2, 4, 3),
(2, 5, 3);
`;
