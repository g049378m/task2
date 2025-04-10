'use strict';

import express from 'express';
import db from '../db/connection.js';
import fb from '../fb/firebase.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Middleware to check session
async function allowed(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  console.log("Session Cookie:", sessionCookie); 
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
    totalPrice: 20,
    status: "draft" 
  };

  try {
    const result = await db.collection('tickets').insertOne(ticket);
    res.redirect(`/tickets/${result.insertedId}`);
  } catch (err) {
    next(err);
  }
});

router.get('/my-tickets', allowed, async (req, res, next) => {
  try {
    const tickets = await db.collection('tickets').find({ user: res.locals.uid }).toArray();
    res.render('my-tickets', { tickets });
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

    const rides = await db.collection('SSP').find().toArray(); // all rides

    res.render('ticket-view', { ticket, rides });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/add-ride', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const rideName = req.body.rideName;

  try {
    const ride = await db.collection('SSP').findOne({ name: rideName });
    if (!ride) return res.status(400).send("Ride not found");

    const result = await db.collection('tickets').updateOne(
      { _id: new ObjectId(ticketId), user: res.locals.uid },
      {
        $push: { fastTrackRides: ride },
        $inc: { totalPrice: ride.fastTrackPrice }
      }
    );

    res.redirect(`/tickets/${ticketId}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/confirm', allowed, async (req, res, next) => {
  const ticketId = req.params.id;

  try {
    const result = await db.collection('tickets').updateOne(
      { _id: new ObjectId(ticketId), user: res.locals.uid },
      { $set: { status: "confirmed" } }
    );

    res.redirect(`/tickets/${ticketId}`);
  } catch (err) {
    next(err);
  }
});



export default router;
