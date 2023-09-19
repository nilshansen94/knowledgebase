/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import mysql from "mysql2";
import {listToTree} from "./utils/list-to-tree";
import { Folder } from './api';
import {getSubFolders} from "./utils/get-sub-folders";
import cors from 'cors';

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'kb_rest'
});

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors());

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

app.get('/user', (req, res) => {
  connection.query('select * from `user`', (err, results, fields) => {
    if(err){
      res.status(500).json(err)
    }
    res.json(results)
  })
});

app.get('/folders/:userId', (req, res) => {
  connection.query('select * from `folder` where user_id = ?', [req.params.userId], (err, rows) => {
    const tree: Folder[] = listToTree(rows as Folder[]);
    res.json(tree);
  })
});

app.get('/snippets/:userId/:folderId?', (req, res) => {
  const userId = req.params.userId;
  connection.query('select * from `folder` where user_id = ?', [userId], (err, rows) => {
    const tree = listToTree(rows as Folder[]);
    let query = `select *
                      from usr_fold_snip
                             join user on user.id = usr_fold_snip.user_id
                             join folder on folder.id = usr_fold_snip.folder
                             join snippet on snippet.id = usr_fold_snip.snip_id
                      where user.id = ?`;
    const folderId = req.params.folderId;
    let folderIds = [];
    if(folderId){
      query += ` and usr_fold_snip.folder in (?)`;
      folderIds = getSubFolders(tree, +folderId);
    }
    connection.query(query, [userId, folderIds], (err, rows) => {
      res.json(rows);
    });
  })
})

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
