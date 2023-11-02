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
import {PoolConnection} from "mysql2/promise";

// create the connection to database
const mysqlConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'kb_rest'
};
const connection = mysql.createConnection(mysqlConfig);
const pool = mysql.createPool(mysqlConfig);
const promisePool = pool.promise();

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
    //console.log('login by session')
    return next();
  }
  if(req.cookies['rememberMe']) {
    //console.log('login by cookie')
    //todo security
    req.session.userId = req.cookies['rememberMe'];
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
//see how to secure the api calls with express middleware: https://www.bezkoder.com/node-js-express-login-example/
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

app.get('/checkLogin', [verifyLogin], (req, res) => {
  res.json({success: true});
});

app.get('/folders/:userId', (req, res) => {
  connection.query('select * from `folder` where user_id = ?', [req.params.userId], (err, rows) => {
    const tree: Folder[] = listToTree(rows as Folder[]);
    res.json(tree);
  })
});

app.get('/snippets/:folderId?', [verifyLogin], (req, res) => {
  const userId = req.session.userId;
  console.log('get snippets for user', userId, 'and folder', req.params.folderId)
  //https://stackoverflow.com/questions/53945089/nodejs-await-async-with-nested-mysql-query
  //todo connection.promise().query()
  connection.query('select * from `folder` where user_id = ?', [userId], (err, rows) => {
    console.log('folders from query', rows)
    const tree = listToTree(rows as Folder[]);
    console.log('tree',tree)
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
      console.log('folderIds',folderIds)
    }
    connection.query(query, [userId, folderIds], (err, rows) => {
      res.json(rows);
    });
  })
})

app.put('/snippet', [verifyLogin], (req, res) => {
  const snippet = req.body;
  const userId = req.session.userId;
  console.log('[title, content, user_id]', [snippet.title, snippet.content, req.session.userId])
  addSnippet(snippet, userId).then(r => {
    res.json(r);
    res.end();
    return;
  });
})

async function addSnippet(snippet, userId) {
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    const [insertResult] = await conn.query('INSERT INTO snippet (title, content, user_id) VALUES (?,?,?)', [snippet.title, snippet.content, userId]);
    // @ts-ignore
    const snippetId = insertResult.insertId;
    const insert2 = await conn.query('INSERT INTO usr_fold_snip (user_id, snip_id, folder) VALUES (?,?,?)', [userId, snippetId, snippet.folder]);
    await conn.commit();
    console.log('committed insert-snip')
    return {success: true};
  } catch(e) {
    console.log('rolling back insert-snip', e)
    await conn?.rollback();
    return {success: false};
  }
}

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
