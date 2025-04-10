'use strict';

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: "1", strict: true, deprecationErrors: true }
});


let db;

try {
  const conn = await client.connect();
  db = conn.db('rides'); 
  console.log("MongoDB connected");
} catch (err) {
  console.error("MongoDB connection failed:", err);
}

export default db;
