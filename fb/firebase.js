'use strict';

import admin from "firebase-admin";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = require(path.join(__dirname, "../key.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
