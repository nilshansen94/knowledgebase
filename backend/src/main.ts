/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import session from 'express-session';
import * as path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {addSnippet, deleteSnippet, getSnippets, pinSnippet, toggleSnippetPublic, updateSnippet} from './utils/rest/snippet-utils';
import {checkUsername, googleCallback, registerUser, userExists, verifyLogin} from './utils/rest/login-utils';
import {addFolder, deleteFolder, getFolders, moveFolders, moveSnippets, renameFolder} from './utils/rest/folder-utils';
import {getCommunitySnippets, getUserName, getUsers} from './utils/rest/comunity-utils';
import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import helmet from 'helmet';
import {setupDb} from './utils/db/db-setup';
import {configDotenv} from 'dotenv';
import {logger} from './utils/logger';
import * as https from 'https';
import * as fs from 'fs';
import multer from 'multer';
import {exportData, getMyUsername, importData} from './utils/rest/profile-utils';

const myMulter = multer({ storage: multer.memoryStorage() });

configDotenv();
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors({
  credentials: true,
  origin: process.env.CORS_ORIGINS.split(',')
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',// Only transmit over HTTPS
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict', // Prevent CSRF
    maxAge: +process.env.SESSION_MAX_AGE, // 1 day expiry
  }
}));
app.use(helmet({
  contentSecurityPolicy: true,
  xssFilter: true,
  hsts: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));
app.use(cookieParser());

setupDb().then(res => {
  logger.info('DB setup successful', res);
  console.log('DB setup successful', res)
}).catch(e => {
  logger.info('DB setup failed,', e.stack.split('\n')[0]);
  console.log('DB setup failed,', e.stack.split('\n')[0]);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL,
    verbose: true,
  },
  async function (accessToken, refreshToken, profile, cb) {
    const userEmail = profile.emails.find(e => e.verified === true).value;
    const existingUser = await userExists(userEmail);

    //it seems that what you put in the profile object will be in the session.passport.user object
    if (existingUser) {
      return cb(null, {...profile, userId: existingUser.id});
    }

    return cb(null, {...profile, isRegistered: false});
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// https://stackoverflow.com/questions/72002750/req-logout-is-not-a-function
app.use(passport.initialize())
app.use(passport.session())

app.get('/api/auth/google',
  passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/api/auth/callback/google',
  passport.authenticate('google', {
    failureRedirect: process.env['UI_URL'] + '/login',
    session: true,
  }),
  async function (req: any, res) {
    await googleCallback(req, res);
  });

//https://stackoverflow.com/questions/65108033
declare module 'express-session' {
  export interface SessionData {
    userId: number;
    secret: string;
    isRegistered: boolean;
    email: string;
  }
}

app.get('/api/check-username/:username', async (req, res) => {
  return await checkUsername(req, res);
});

app.put('/api/register', async (req, res) => {
  return await registerUser(req, res);
})

app.get('/api/checkLogin', [verifyLogin], (req, res) => {
  res.json({success: true});
  res.end();
});

app.get('/api/logout', async (req, res) => {
  req.logout(() => {
    req.session.destroy((e) => {
      console.warn('Logout: Could not destroy session', e);
    });
    console.log('logged out');
    res.end();
    return res;
  });
})

app.get('/api/folders', [verifyLogin], async (req, res) => {
  const folders = await getFolders(req, res);
  res.json(folders);
  return res;
});

app.put('/api/addFolder', [verifyLogin], async (req, res) => {
  return await addFolder(req, res);
})

app.post('/api/renameFolder', [verifyLogin], async (req, res) => {
  return await renameFolder(req, res);
})

app.post('/api/moveFolders', [verifyLogin], async (req, res) => {
  return await moveFolders(req, res);
})

app.delete('/api/folder/:id', [verifyLogin], async (req, res) => {
  return await deleteFolder(req, res);
})

app.post('/api/moveSnippets', [verifyLogin], async (req, res) => {
  return await moveSnippets(req, res);
})

app.get('/api/snippets/:folderId?', [verifyLogin], async (req, res) => {
  return await getSnippets(req, res);
})

app.put('/api/snippet', [verifyLogin], async (req, res) => {
  return await addSnippet(req, res);
})

app.post('/api/snippet', [verifyLogin], async (req, res) => {
  return await updateSnippet(req, res);
})

app.post('/api/snippet-public', [verifyLogin], async (req, res) => {
  return await toggleSnippetPublic(req, res);
})

/** pin or unpin a foreign snippet in your folder */
app.post('/api/snippet-pin', [verifyLogin], async (req, res) => {
  return await pinSnippet(req, res);
})

app.delete('/api/snippet/:id', [verifyLogin], async (req, res) => {
  return await deleteSnippet(req, res);
})

app.get('/api/users', [verifyLogin], async (req, res) => {
  return await getUsers(req, res);
})

app.get('/api/username/:id', [verifyLogin], async (req, res) => {
  return await getUserName(req, res);
})

app.get('/api/my-username', [verifyLogin], async (req, res) => {
  return await getMyUsername(req, res);
})

app.get('/api/communitySnippets/:search?', [verifyLogin], async (req, res) => {
  return await getCommunitySnippets(req, res);
})

app.get('/api/version', (req, res) => {
  console.log('get version', {version: process.env.npm_package_version});
  res.json({version: process.env.npm_package_version});
  res.end();
})

app.get('/api/export', [verifyLogin], async (req, res ) => {
  console.log('exportData starting');
  const data = await exportData(req, res);
  const jsonString = JSON.stringify(data, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="export.json"');
  res.send(jsonString);
})

app.post('/api/import', [verifyLogin, myMulter.single('importData')], async (req, res) => {
  await importData(req, res);
});

const certificate = fs.readFileSync(process.env.SSH_CERTIFICATE, 'utf8');
const privateKey  = fs.readFileSync(process.env.SSH_PRIVATE_KEY, 'utf8');
const credentials = {key: privateKey, cert: certificate};// passphrase: 'asdf'
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443, () => {
  console.log(`https server listening on port 8443`);
  logger.info('https server listening on port 8443');
});
httpsServer.on('error', e => {
  console.log('https server error', e);
  logger.info('https server error' + JSON.stringify(e));
});
