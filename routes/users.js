'use strict';

import express from 'express';
import fb from '../fb/firebase.js';

const router = express.Router();

// Verifies Firebase session cookie
async function allowed(req, res, next) {
  const sessionCookie = req.cookies.session || "";

  try {
    const decoded = await fb.auth().verifySessionCookie(sessionCookie, true);
    res.locals.uid = decoded.uid;
    res.locals.email = decoded.email;
    next();
  } catch (error) {
    error.status = 401;
    next(error);
  }
}


// Sign-up page route
router.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

// Create session cookie
router.post('/sign-in', async (req, res, next) => {
  const expiresIn = 1000 * 60 * 60 * 24 * 5;
  const idToken = req.body.idToken.toString();
  const options = { maxAge: expiresIn, httpOnly: true };

  try {
    const sessionCookie = await fb.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie("session", sessionCookie, options);
    res.status(200).end();
      } catch (error) {
    error.status = 401;
    next(error);
  }
});

// Show welcome page after login/signup
router.get('/welcome', allowed, (req, res) => {
  res.render('welcome', { email: res.locals.email });
});

// Sign-out user
router.post('/sign-out', async (req, res) => {
  const sessionCookie = req.cookies.session || "";

  try {
    const decoded = await fb.auth().verifySessionCookie(sessionCookie);
    await fb.auth().revokeRefreshTokens(decoded.sub);
  } catch (err) {
    console.error("Error during sign-out:", err);
  }

  res.clearCookie("session");
  res.redirect("/users/sign-in");
});


export default router;
