// Simulated client-side Firebase Auth & Firestore replacement using localStorage
// This removes all external Firebase SDK dependencies while keeping App.jsx functional

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export const db = {};
export const googleProvider = {};

let currentAuthUser = null;
const listeners = new Set();

// Restore mocked Google user if stored in localStorage
const storedUser = localStorage.getItem("rmx_mock_google_user");
if (storedUser) {
  try {
    currentAuthUser = JSON.parse(storedUser);
  } catch (e) {
    currentAuthUser = null;
  }
}

export const auth = {
  get currentUser() {
    return currentAuthUser;
  }
};

export const onAuthStateChanged = (authObj, callback) => {
  listeners.add(callback);
  // Trigger callback immediately with current mock auth status
  callback(currentAuthUser);
  return () => {
    listeners.delete(callback);
  };
};

function triggerAuthChange() {
  for (const cb of listeners) {
    cb(currentAuthUser);
  }
}

export const signInWithPopup = async (authObj, provider) => {
  const mockUser = {
    uid: "google_mock_" + Math.random().toString(36).substring(2, 9),
    displayName: "Commander Developer",
    email: "commander@flow16.local",
    photoURL: null,
    isGoogleMock: true
  };
  currentAuthUser = mockUser;
  localStorage.setItem("rmx_mock_google_user", JSON.stringify(mockUser));
  triggerAuthChange();
  return { user: mockUser };
};

export const signOut = async (authObj) => {
  currentAuthUser = null;
  localStorage.removeItem("rmx_mock_google_user");
  triggerAuthChange();
};

export const doc = (dbInstance, collection, id) => {
  return {
    collection,
    id,
    path: `${collection}/${id}`
  };
};

export const getDoc = async (docRef) => {
  const key = `mock_firestore_db:${docRef.collection}:${docRef.id}`;
  const rawData = localStorage.getItem(key);
  let data = null;
  if (rawData) {
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = null;
    }
  }
  return {
    exists: () => data !== null,
    data: () => data
  };
};

export const setDoc = async (docRef, data, options) => {
  const key = `mock_firestore_db:${docRef.collection}:${docRef.id}`;
  let finalData = data;
  if (options && options.merge) {
    const rawData = localStorage.getItem(key);
    let existing = {};
    if (rawData) {
      try {
        existing = JSON.parse(rawData);
      } catch (e) {
        existing = {};
      }
    }
    finalData = { ...existing, ...data };
  }
  localStorage.setItem(key, JSON.stringify(finalData));
};

export const serverTimestamp = () => new Date().toISOString();

export function handleFirestoreError(error, operationType, path) {
  console.error("Mock Firestore Error:", error, operationType, path);
}
