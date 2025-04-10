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

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/users', userRoutes);
app.use('/rides', rideRoutes);
app.use('/tickets', ticketRoutes);


app.get('/', (req, res) => {
  res.render('home');
});



// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.disable('x-powered-by');

// Start Server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
