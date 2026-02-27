const localStore = {
  reports: {},
  notifications: {},
};

const getByPath = (source, path = '') => {
  if (!path) return source;
  return path.split('/').filter(Boolean).reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return acc[key];
    }
    return undefined;
  }, source);
};

const setByPath = (source, path = '', value) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let current = source;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
};

const createSnapshot = (value) => ({
  exists: () => value !== null && value !== undefined,
  val: () => value,
});

export const getDatabase = () => ({ data: localStore });

export const ref = (db, path = '') => ({ db, path });

export const onValue = (reference, callback, errorCallback) => {
  try {
    const value = getByPath(reference.db.data, reference.path);
    callback(createSnapshot(value));
  } catch (error) {
    if (typeof errorCallback === 'function') {
      errorCallback(error);
    }
  }

  return () => {};
};

export const query = (reference) => reference;

export const orderByChild = (field) => ({ type: 'orderByChild', field });

export const limitToLast = (count) => ({ type: 'limitToLast', count });

export const update = async (reference, updates = {}) => {
  const previousValue = getByPath(reference.db.data, reference.path);
  const nextValue = {
    ...(previousValue && typeof previousValue === 'object' ? previousValue : {}),
    ...updates,
  };

  setByPath(reference.db.data, reference.path, nextValue);
  return true;
};

export const push = async (reference, value = {}) => {
  const key = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const basePath = reference.path ? `${reference.path}/${key}` : key;
  setByPath(reference.db.data, basePath, value);

  return {
    key,
    ...ref(reference.db, basePath),
  };
};

export const serverTimestamp = () => Date.now();
