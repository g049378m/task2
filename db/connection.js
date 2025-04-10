'use strict';

import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://g049378m:OfzwyISubTKZt7St@ssp.kcsy9p9.mongodb.net/SSP?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false&appName=SSP";

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
