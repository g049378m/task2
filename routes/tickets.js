'use strict';

import express from 'express';
import db from '../db/connection.js';
import fb from '../fb/firebase.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Middleware to check session
async function allowed(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  console.log("🔐 Session Cookie:", sessionCookie); 
  try {
    const decoded = await fb.auth().verifySessionCookie(sessionCookie, true);
    res.locals.uid = decoded.uid;
    res.locals.email = decoded.email;
    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
}

// Ticket order form (GET)
router.get('/order', allowed, (req, res) => {
  res.render('ticket-order');
});

// Create ticket (POST)
router.post('/order', allowed, async (req, res, next) => {
  const { visitDate } = req.body;
  const ticket = {
    user: res.locals.uid,
    visitDate,
    fastTrackRides: [],
    totalPrice: 20
  };

  try {
    const result = await db.collection('tickets').insertOne(ticket);
    res.redirect(`/tickets/${result.insertedId}`);
  } catch (err) {
    next(err);
  }
});

// Ticket confirmation page
router.get('/:id', allowed, async (req, res, next) => {
  const ticketId = req.params.id;

  try {
    const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });

    if (!ticket || ticket.user !== res.locals.uid) {
      return res.status(403).send("Ticket not found or you don’t have access to it.");
    }

    res.render('ticket-view', { ticket });
  } catch (err) {
    next(err);
  }
});

export default router;
