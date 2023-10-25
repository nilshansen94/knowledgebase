/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import session from "express-session";
import * as path from 'path';
import mysql from "mysql2";
import {listToTree} from "./utils/list-to-tree";
import {Folder} from './api';
import {getSubFolders} from "./utils/get-sub-folders";
import cors from 'cors';
import cookieParser from "cookie-parser";

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
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());

//todo move to file. Is not secure yet.
//todo remember me (with cookies: https://stackoverflow.com/questions/16209145)
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    console.log('login by session')
    return next();
  }
  if(req.cookies['rememberMe']) {
    console.log('login by cookie')
    return next();
  }
  return res.status(403).send({message: 'No access, you are not logged in'});
}

app.get('/api', [verifyLogin], (req, res) => {
  res.send({message: 'Welcome to backend!'});
});

//see https://codeshack.io/basic-login-system-nodejs-express-mysql/
//and https://stackoverflow.com/questions/12276046/nodejs-express-how-to-secure-a-url
//security: https://expressjs.com/en/advanced/best-practice-security.html
//see how to secure the api calls with express middlewaren: https://www.bezkoder.com/node-js-express-login-example/
app.post('/login', (req, res) => {
  console.log(req.body)
  const username = req.body.username;
  const pw = req.body.password;
  const query = 'SELECT id, name FROM `user` WHERE name = ?';
  connection.query(query, [username], (err, rows) => {
    if (err) {
      res.json({success: false})
      res.end();
      return;
    }
    const result = rows as any[];
    //todo security. check username and PW
    if (result.length === 1) {
      // @ts-ignore
      req.session.loggedIn = true;
      // @ts-ignore
      req.session.userId = result[0].id;
      //todo not safe
      res.cookie('rememberMe', result[0].id);
      res.json({success: true});
      res.end();
      return;
    }
    res.json({success: false})
    res.end();
  })
})

app.get('/user', (req, res) => {
  connection.query('select * from `user`', (err, results, fields) => {
    if (err) {
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
    if (folderId) {
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
