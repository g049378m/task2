'use strict';

import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rides = await db.collection('SSP').find().toArray(); 
    console.log("All rides:", rides);
    res.render('rides', { rides });
  } catch (err) {
    next(err);
  }
});

export default router;
