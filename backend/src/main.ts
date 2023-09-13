/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import mysql from "mysql2";
import {listToTree} from "./utils/list-to-tree";

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
  console.log(req.params)
  connection.query('select * from `folder` where user_id = ?', [req.params.userId], (err, rows) => {
    const tree = listToTree(rows as any[]);
    res.json(tree);
  })
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
