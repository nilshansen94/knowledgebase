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
    secure: process.env.NODE_ENV === 'production', // Only transmit over HTTPS
    httpOnly: true, // Prevent XSS
    sameSite: 'strict', // Prevent CSRF
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
  console.log('DB setup successful', res)
}).catch(e => {
  console.log('DB setup failed,', e.stack.split('\n')[0]);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL
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

app.get('/auth/google',
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

//index.html
app.get('/', function(req, res) {
  res.json('{"success: "true"}')
});

app.get('/check-username/:username', async (req, res) => {
  return await checkUsername(req, res);
});

app.put('/register', async (req, res) => {
  return await registerUser(req, res);
})

app.get('/checkLogin', [verifyLogin], (req, res) => {
  res.json({success: true});
  res.end();
});

app.get('/logout', async (req, res) => {
  req.logout(() => {
    req.session.destroy((e) => {
      console.warn('Logout: Could not destroy session', e);
    });
    console.log('logged out');
    res.end();
    return res;
  });
})

app.get('/folders', [verifyLogin], async (req, res) => {
  return await getFolders(req, res);
});

app.put('/addFolder', [verifyLogin], async (req, res) => {
  return await addFolder(req, res);
})

app.post('/renameFolder', [verifyLogin], async (req, res) => {
  return await renameFolder(req, res);
})

app.post('/moveFolders', [verifyLogin], async (req, res) => {
  return await moveFolders(req, res);
})

app.delete('/folder/:id', [verifyLogin], async (req, res) => {
  return await deleteFolder(req, res);
})

app.post('/moveSnippets', [verifyLogin], async (req, res) => {
  return await moveSnippets(req, res);
})

app.get('/snippets/:folderId?', [verifyLogin], async (req, res) => {
  return await getSnippets(req, res);
})

app.put('/snippet', [verifyLogin], async (req, res) => {
  return await addSnippet(req, res);
})

app.post('/snippet', [verifyLogin], async (req, res) => {
  return await updateSnippet(req, res);
})

app.post('/snippet-public', [verifyLogin], async (req, res) => {
  return await toggleSnippetPublic(req, res);
})

/** pin or unpin a foreign snippet in your folder */
app.post('/snippet-pin', [verifyLogin], async (req, res) => {
  return await pinSnippet(req, res);
})

app.delete('/snippet/:id', [verifyLogin], async (req, res) => {
  return await deleteSnippet(req, res);
})

app.get('/users', [verifyLogin], async (req, res) => {
  return await getUsers(req, res);
})

app.get('/username/:id', [verifyLogin], async (req, res) => {
  return await getUserName(req, res);
})

app.get('/communitySnippets/:search?', [verifyLogin], async (req, res) => {
  return await getCommunitySnippets(req, res);
})

const port = +(process.env.PORT);
const host = process.env.HOST;
const server = app.listen(port, host, () => {
  console.log(`Listening at ${host}:${port}/api`);
});
server.on('error', console.error);
