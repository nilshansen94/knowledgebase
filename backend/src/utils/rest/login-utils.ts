import {promisePool} from '../db/db-config';
import {Request, Response} from 'express';
import {DbUser} from '../../api';
import {ResultSetHeader, RowDataPacket} from 'mysql2';

export const verifyLogin = async (req, res, next) => {
  if(req.isAuthenticated() && req.session.isRegistered) {
    return next();
  }
  return res.status(403).send({message: 'Login by oauth denied'});
  // await verifyByDb(req, res, next);
}

export async function googleCallback(req: any, res: Response) {
  console.log('verify in callback')
  const user = req.user;
  const userEmail = req.user.emails.find(e => e.verified === true).value;
  req.session.email = userEmail;
  const existingUser = await userExists(userEmail);
  if (existingUser) {
    req.session.userId = user.userId;
    req.session.isRegistered = true;
    res.redirect(process.env['UI_URL']);
  } else {
    res.redirect(process.env['UI_URL'] + '/register');
  }
}

export async function userExists(email: string): Promise<DbUser | null> {
  const conn = await promisePool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM user WHERE email = ?', [email]);
    return rows[0] ? rows[0] as DbUser : null;
  } finally {
    conn.release();
  }
}

export async function addUser(name: string, email: string): Promise<DbUser> {
  const conn = await promisePool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>('INSERT INTO `user` (name, email) VALUES (?, ?)', [name, email]);
    return { id: result.insertId, name, email, password: null, salt: null, secret: null };
  } catch (e) {
    console.error(e);
  } finally {
    conn.release();
  }
}

export async function checkUsername(req: Request, res: Response) {
  const username = req.params.username;
  const conn = await promisePool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM `user` WHERE name = :name', {name: username});
    res.json({available: rows.length === 0});
  } catch (e) {
    console.error(e);
  } finally {
    conn.release();
  }
}

export async function registerUser(req: Request, res: Response){
  console.log('register request', req.session.email)
  if (!req.session.email || req.session.isRegistered) {
    return res.status(400).json({success: false, message: 'Invalid registration attempt'});
  }

  const {username} = req.body;
  console.log('register', username, req.body)
  if (!username || username.length < 3) {
    console.log('register: invalid username')
    return res.status(400).json({success: false, message: 'Invalid username'});
  }

  try {
    console.log('register user', username, req.session.email)
    const user = await addUser(username, req.session.email);
    req.session.userId = user.id;
    req.session.isRegistered = true;
    return res.json({success: true});
  } catch (error) {

    return res.status(400).json({success: false, message: 'Registration failed'});
  }
}
