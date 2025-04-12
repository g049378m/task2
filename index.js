'use strict';

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import userRoutes from './routes/users.js';
import rideRoutes from './routes/rides.js';
import ticketRoutes from './routes/tickets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// ✅ 1. View Engine — this MUST come before defining routes that render views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

// ✅ 2. Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// ✅ 3. Routes
app.use('/users', userRoutes);
app.use('/rides', rideRoutes);
app.use('/tickets', ticketRoutes);

// ✅ 4. Homepage
app.get('/', (req, res) => {
  res.render('home');
});

// ✅ 5. 404 Handler — must come *after* all other routes
app.use((req, res) => {
  res.status(404).render('error-404');
});

// ✅ 6. Global Error Handler (401, 403, 500)
app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);
  
  switch (err.status) {
    case 401:
      res.status(401).render('error-401', { message: err.message || null });
      break;
    case 403:
      res.status(403).render('error-403', { message: err.message || null });
      break;
    case 404:
      res.status(404).render('error-404');
      break;
    default:
      res.status(500).render('error-500', { message: err.message || null });
  }
});

// ✅ 7. Start Server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
