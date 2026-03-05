const safeJsonParse = (value, fallback) => {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const storage = {
  getString(key) {
    return localStorage.getItem(key);
  },
  setString(key, value) {
    localStorage.setItem(key, value);
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  getJson(key, fallback = null) {
    return safeJsonParse(localStorage.getItem(key), fallback);
  },
  setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
