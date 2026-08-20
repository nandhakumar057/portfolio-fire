/**
 * Firebase Admin SDK configuration.
 *
 * Credentials are loaded in this priority:
 *   1. Environment variables  (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 *   2. serviceAccountKey.json file in this directory (git-ignored)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let app = null;

function getApp() {
  if (app) return app;

  let credential;

  // ── Option 1: environment variables ──────────────────────────────
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    credential = admin.credential.cert({ projectId, clientEmail, privateKey });
  } else {
    // ── Option 2: serviceAccountKey.json in this directory ─────────
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('[firebase] Loaded credentials from serviceAccountKey.json');
    } else {
      throw new Error(
        'Firebase credentials not found. Either:\n' +
          '  1. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env, or\n' +
          '  2. Place serviceAccountKey.json in server/src/config/\n' +
          'Get the key from: Firebase Console → Project Settings → Service Accounts → Generate new private key'
      );
    }
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  app = admin.initializeApp({
    credential,
    ...(storageBucket ? { storageBucket } : {}),
  });

  const pid = projectId || app.options.projectId;
  console.log(`[firebase] Initialized for project ${pid}`);
  return app;
}

function getFirestore() {
  return getApp().firestore();
}

function getStorage() {
  return getApp().storage();
}

module.exports = { getApp, getFirestore, getStorage };
