import {Request, Response} from 'express';
import {DbUser} from '../../api';
import {select} from '../db/db-config';
import {User} from '../db/db-models';

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
  const rows = await select('SELECT * FROM user WHERE email = $email', {email});
  return rows[0] ? rows[0] as DbUser : null;
}

export async function addUser(name: string, email: string): Promise<DbUser> {
  try {
    const newUser = new User({name, email});
    await newUser.save();
    return { id: newUser.id, name, email, password: null, salt: null, secret: null };
  } catch (e) {
    console.error(e);
  }
}

export async function checkUsername(req: Request, res: Response) {
  const username = req.params.username;
  try {
    const rows = await select('SELECT * FROM `user` WHERE name = $name', {name: username});
    res.json({available: rows.length === 0});
  } catch (e) {
    console.error(e);
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
