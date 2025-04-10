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
    ticketPrice: 20,
    fastTrackTotal: 0,
    fastTrackPaid: false,
    fastTrackRides: [],
    usedFastTrackRides: [],
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

    const rides = await db.collection('SSP').find().toArray(); 

    res.render('ticket-view', { ticket, rides });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/add-ride', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const rideName = req.body.rideName;
  const today = new Date().toISOString().split("T")[0];

  try {
    const ride = await db.collection('SSP').findOne({ name: rideName });
    if (!ride) return res.status(400).send("Ride not found");

    const ticket = await db.collection('tickets').findOne({
      _id: new ObjectId(ticketId),
      user: res.locals.uid
    });

    if (!ticket) return res.status(404).send("Ticket not found");

   
    if (ticket.visitDate <= today) {
      return res.status(400).send("You can't add rides to past or today's ticket.");
    }

    await db.collection('tickets').updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { fastTrackRides: { $each: rides } },
        $inc: { fastTrackTotal: totalExtra },
        $set: { fastTrackPaid: true }
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

router.get('/:id/use-rides', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const today = new Date().toISOString().split("T")[0];

  try {
    const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });

    if (!ticket || ticket.user !== res.locals.uid) {
      return res.status(403).send("Ticket not found or access denied.");
    }

    if (ticket.visitDate !== today || ticket.status !== "confirmed") {
      return res.status(400).send("Ride usage only allowed on visit day and for confirmed tickets.");
    }

    res.render('use-rides', { ticket });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/use-ride', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const rideName = req.body.rideName;

  try {

    await db.collection('tickets').updateOne(
      { _id: new ObjectId(ticketId), user: res.locals.uid },
      {
        $pull: { fastTrackRides: { name: rideName } },
        $push: { usedFastTrackRides: rideName }
      }
    );
    


    res.redirect(`/tickets/${ticketId}/use-rides`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/select-rides', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const today = new Date().toISOString().split("T")[0];

  try {
    const ticket = await db.collection('tickets').findOne({
      _id: new ObjectId(ticketId),
      user: res.locals.uid
    });

    if (!ticket || ticket.visitDate <= today) {
      return res.status(400).send("This ticket can't be modified.");
    }

    const rides = await db.collection('SSP').find().toArray();
    res.render('select-rides', { ticket, rides });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/select-rides', allowed, async (req, res, next) => {
  const ticketId = req.params.id;
  const rideNames = req.body.rideNames;
  const today = new Date().toISOString().split("T")[0];

  try {
    const ticket = await db.collection('tickets').findOne({
      _id: new ObjectId(ticketId),
      user: res.locals.uid
    });

    if (!ticket || ticket.visitDate < today) {
      return res.status(400).send("This ticket can't be modified.");
    }

    // Make sure it's always an array
    const selectedNames = Array.isArray(rideNames) ? rideNames : [rideNames];

    // Fetch ride details from database
    const rides = await db.collection('SSP')
      .find({ name: { $in: selectedNames } })

      .toArray();

    if (!rides.length) {
      return res.status(400).send("No valid rides selected.");
    }

    const totalExtra = rides.reduce((sum, ride) => sum + ride.fastTrackPrice, 0);

    await db.collection('tickets').updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { fastTrackRides: { $each: rides } },
        $inc: { totalPrice: totalExtra }
      }
    );

    res.redirect(`/tickets/${ticketId}`);
  } catch (err) {
    next(err);
  }
});




export default router;
