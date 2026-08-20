/**
 * Picks the active data store: Firestore when Firebase credentials are
 * configured, otherwise the local JSON file store (so dev works out of
 * the box). Firebase Firestore is the official database.
 */

let store = null;
let mode = 'json';

async function getStore() {
  if (store) return store;

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (projectId) {
    try {
      const firestoreStore = require('../stores/firestoreStore').default;
      await firestoreStore.ping();
      store = firestoreStore;
      mode = 'firestore';
      console.log(`[db] Connected to Firestore (project: ${projectId})`);
    } catch (err) {
      console.warn(
        `[db] Firestore check failed (${err.message}) — falling back to JSON file store. ` +
          'Check your Firebase credentials in .env.'
      );
      const jsonStore = require('../stores/jsonStore').default;
      store = jsonStore;
    }
  } else {
    console.log(
      '[db] Using JSON file store (server/data/db.json). Set FIREBASE_PROJECT_ID & ' +
        'FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY to switch to Firestore.'
    );
    const jsonStore = require('../stores/jsonStore').default;
    store = jsonStore;
  }
  return store;
}

function getMode() {
  return mode;
}

module.exports = { getStore, getMode };
