/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import session from 'express-session';
import * as path from 'path';
import mysql from 'mysql2';
import {getSubFolders, listToTree, loginByCookie, loginByPw, register} from './utils';
import {Folder} from './api';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {PoolConnection} from 'mysql2/promise';
import {LoginRequest, SALT_ROUNDS} from '@kb-rest/shared';
import * as bcrypt from 'bcrypt';

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
  //todo use env variable
  secret: '573696fb-8612-4f29-988c-062390c72694',
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());

//https://stackoverflow.com/questions/65108033
declare module 'express-session' {
  export interface SessionData {
    userId: number;
    secret: string;
  }
}

//todo move to file. Is not secure yet.
//todo remember me (with cookies: https://stackoverflow.com/questions/16209145)
const verifyLogin = async (req, res, next) => {
  const conn = await promisePool.getConnection();
  if (req.session.secret) {
    const loginResult = await loginByCookie(req.session.userId, req.session.secret, req.headers['user-agent'], conn);
    conn.release();
    if(!loginResult){
      return res.status(403).send({message: 'Login by session denied'});
    }
    console.log('login by session');
    return next();
  }
  if(req.cookies && req.cookies['secret']) {
    console.log('login by cookie')
    const userId = req.cookies['userId'];
    const byCookieResult = await loginByCookie(userId, req.cookies['secret'], req.headers['user-agent'], conn);
    conn.release();
    if(byCookieResult) {
      req.session.userId = userId;
      return next();
    }
    conn.release();
    return res.status(403).send({message: 'Login by cookie denied'});
  }
  console.log('not logged in')
  return res.status(403).send({message: 'No access, you are not logged in'});
}

app.post('/register', async (req, res) => {
  //todo verify email
  const request = req.body as LoginRequest;
  try {
    const conn = await promisePool.getConnection();
    const userId = await register(request, conn);
    res.json({userId, success: true});
    res.end();
  } catch(e) {
    //todo return types
    console.log('error during registration', e)
    return res.status(403).send({success: false, message: e});
  }
})

//see https://codeshack.io/basic-login-system-nodejs-express-mysql/
//and https://stackoverflow.com/questions/12276046/nodejs-express-how-to-secure-a-url
//security: https://expressjs.com/en/advanced/best-practice-security.html
//see how to secure the api calls with express middleware: https://www.bezkoder.com/node-js-express-login-example/
app.post('/login', async (req, res) => {
  const loginRequest = req.body as LoginRequest;
  const conn = await promisePool.getConnection();
  await conn.beginTransaction();
  const loginResult = await loginByPw(loginRequest, conn);
  if(loginResult.success === false) {
    await conn.commit();
    return res.status(403).send({success: false});
  }
  const secret = await bcrypt.genSalt(SALT_ROUNDS);
  const secretForDb = await bcrypt.hash(secret + req.headers['user-agent'], SALT_ROUNDS);
  const query = 'UPDATE `user` SET secret=? WHERE name=?';
  const result = await conn.query(query, [secretForDb, loginRequest.user]);
  await conn.commit();
  res.cookie('secret', secret);
  res.cookie('userId', loginResult.userId);
  req.session.secret = secret;
  req.session.userId = loginResult.userId;
  res.json({userId: loginResult.userId, success: true});
  res.end();
})

app.get('/checkLogin', [verifyLogin], (req, res) => {
  res.json({success: true});
  res.end();
});

app.get('/logout', async (req, res) => {
  const userId = req.session.userId;
  if(!userId){
    console.warn('Trying to logout, but no session is set');
    return;
  }
  connection.query('UPDATE user SET secret = NULL WHERE id = ?', [userId], (err, rows) => {
    if(err){
      console.error('Could not logout user', userId, err);
    }
    if(req.session){
      req.session.destroy((e) => {
        console.error('Logout: Could not destroy session')
        res.end();
      });
    }
    res.end();
  });
})

app.get('/folders', [verifyLogin],  (req, res) => {
  connection.query('select * from `folder` where user_id = ?', [req.session.userId], (err, rows) => {
    const tree: Folder[] = listToTree(rows as Folder[]);
    res.json(tree);
  })
});

app.put('/addFolder', [verifyLogin], (req, res) => {
  const folder = req.body;
  const userId = req.session.userId;
  addFolder(folder, userId).then(r => {
    res.json(r);
    res.end();
    return;
  });
})

app.post('/moveFolders', [verifyLogin], (req, res) => {
  const data = req.body as number[][];
  console.log('/moveFolder', data)
  const userId = req.session.userId;
  //todo check userId?
  moveFolders(data).then(r => {
    res.json(r);
    res.end();
    return;
  })
})

app.post('/moveSnippets', [verifyLogin], (req, res) => {
  const data = req.body as number[][];
  console.log('/moveSnippets', data)
  const userId = req.session.userId;
  //todo check userId?
  moveSnippets(data).then(r => {
    res.json(r);
    res.end();
    return;
  })
})

app.get('/snippets/:folderId?', [verifyLogin], (req, res) => {
  const userId = req.session.userId;
  //console.log('get snippets for user', userId, 'and folder', req.params.folderId)
  //https://stackoverflow.com/questions/53945089/nodejs-await-async-with-nested-mysql-query
  //todo connection.promise().query()
  connection.query('select * from `folder` where user_id = ?', [userId], (err, rows) => {
    //console.log('folders from query', rows)
    const tree = listToTree(rows as Folder[]);
    //console.log('tree',tree)
    let query = `select snippet.*, usr_fold_snip.folder
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
      //console.log('folderIds',folderIds)
    }
    connection.query(query, [userId, folderIds], (err, rows) => {
      res.json(rows);
    });
  })
})

app.put('/snippet', [verifyLogin], (req, res) => {
  const snippet = req.body;
  const userId = req.session.userId;
  //console.log('[title, content, user_id]', [snippet.title, snippet.content, req.session.userId])
  addSnippet(snippet, userId).then(r => {
    res.json(r);
    res.end();
    return;
  });
})

app.post('/snippet', [verifyLogin], (req, res) => {
  const snippet = req.body;
  const userId = req.session.userId;
  updateSnippet(snippet, userId).then(r => {
    res.json(r);
    res.end();
    return;
  });
})

app.delete('/snippet/:id', [verifyLogin], (req, res) => {
  const snippetId = req.params.id;
  const userId = req.session.userId;
  deleteSnippet(snippetId, userId).then(r => {
    res.json(r);
    res.end();
    return;
  })
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

async function updateSnippet(snippet, userId) {
  //todo check user_id?
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    const [result] = await conn.query('UPDATE snippet SET title = ?, content = ? WHERE id = ?', [snippet.title, snippet.content, snippet.id]);
    // @ts-ignore
    console.log(result);
    await conn.commit();
    console.log('committed update-snip')
    // @ts-ignore
    return {success: result?.affectedRows === 1};
  } catch(e) {
    console.log('rolling back update-snip', e)
    await conn?.rollback();
    return {success: false};
  }
}

async function deleteSnippet(snippetId, userId) {
  //todo check userId?
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    const [result] = await conn.query('DELETE FROM snippet WHERE id = ?', [snippetId]);
    // @ts-ignore
    console.log(result);
    await conn.commit();
    console.log('committed delete-snip')
    // @ts-ignore
    return {success: result?.affectedRows === 1};
  } catch(e) {
    console.log('rolling back delete-snip', e)
    await conn?.rollback();
    return {success: false};
  }
}

async function addFolder(folder: Folder, userId: number) {
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    const [insertResult] = await conn.query('INSERT INTO folder(name, parent_id, user_id) VALUES (?,?,?)', [folder.name, folder.parent_id, userId]);
    await conn.commit();
    console.log('committed insert-folder')
    return {success: true};
  } catch(e) {
    console.log('rolling back insert-folder', e)
    await conn?.rollback();
    return {success: false};
  }
}

async function moveFolders(data: number[][]) {
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    for(const d of data){
      //todo await needed?
      conn.query('UPDATE folder SET parent_id = ? WHERE id = ?', d);
    }
    await conn.commit();
    console.log('committed move-folders')
    return {success: true};
  } catch(e) {
    console.log('rolling back move-folders', e)
    await conn?.rollback();
    return {success: false};
  }
}

async function moveSnippets(data: number[][]) {
  let conn: PoolConnection;
  try {
    conn = await promisePool.getConnection();
    await conn.beginTransaction();
    //userId is req.session.userId
    for(const d of data){
      console.log('UPDATE usr_fold_snip SET folder = ? WHERE snip_id = ?', JSON.stringify(d))
      await conn.query('UPDATE usr_fold_snip SET folder = ? WHERE snip_id = ?', d);
    }
    await conn.commit();
    console.log('committed move-snippets')
    return {success: true};
  } catch(e) {
    console.log('rolling back move-snippets', e)
    await conn?.rollback();
    return {success: false};
  }
}


const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
