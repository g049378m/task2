'use strict';

import express from 'express';
import fb from '../fb/firebase.js';

const router = express.Router();

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

export default router;
