/**
 * Firestore-backed data store implementing the same interface as jsonStore.
 * Uses Firestore document IDs for storage and a separate `id` field (UUID)
 * for the application layer, matching the existing contract.
 */

const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');

function col(name) {
  return getFirestore().collection(name);
}

const firestoreStore = {
  async findAll(collection) {
    try {
      const snap = await col(collection).orderBy('createdAt', 'asc').get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      // Fallback: if the index for orderBy('createdAt') is missing or any
      // other Firestore error occurs, try without ordering.
      console.warn(`[firestore] findAll orderBy failed for ${collection}:`, err.message);
      const snap = await col(collection).get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  },

  async findById(collection, id) {
    // Firestore doc IDs are auto-generated; the app uses a UUID in the `id`
    // field. Query by field to stay compatible with the existing contract.
    const snap = await col(collection).where('id', '==', id).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async findOne(collection, query) {
    const entries = Object.entries(query);
    let q = col(collection);
    for (const [k, v] of entries) {
      q = q.where(k, '==', v);
    }
    const snap = await q.limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async create(collection, data) {
    const ref = col(collection).doc();
    const item = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    // Store the app-level `id` field so findById can query by it
    await ref.set(item);
    return item;
  },

  async update(collection, id, data) {
    // Find by the `id` field (not doc ID)
    const snap = await col(collection).where('id', '==', id).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const updates = { ...data, updatedAt: new Date().toISOString() };
    await doc.ref.update(updates);
    return { id: doc.id, ...doc.data(), ...updates };
  },

  async remove(collection, id) {
    const snap = await col(collection).where('id', '==', id).limit(1).get();
    if (snap.empty) return false;
    await snap.docs[0].ref.delete();
    return true;
  },

  /**
   * Upsert keyed on one or more columns. Used by analytics so concurrent
   * first hits on the same (date, path) don't double-create.
   */
  async upsert(collection, data, onConflict) {
    const keys = String(onConflict).split(',').map((k) => k.trim());

    // Build a query filtering on the conflict fields
    let q = col(collection);
    for (const k of keys) {
      q = q.where(k, '==', data[k]);
    }
    const snap = await q.limit(1).get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      const updates = { ...data, updatedAt: new Date().toISOString() };
      await doc.ref.update(updates);
      return { id: doc.id, ...doc.data(), ...updates };
    }

    // No existing doc — create one
    const ref = col(collection).doc();
    const item = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    await ref.set(item);
    return item;
  },

  async count(collection) {
    const snap = await col(collection).count().get();
    return snap.data().count || 0;
  },

  /**
   * Connection check — verifies Firestore is reachable.
   */
  async ping() {
    // A lightweight read to confirm credentials and connectivity
    await col('_ping').limit(1).get();
    return true;
  },
};

module.exports = { default: firestoreStore };
