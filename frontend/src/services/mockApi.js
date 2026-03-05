import { storage } from '../utils/storage';
import axios from 'axios';

const KEYS = {
  authToken: 'pc_auth_token',
  authRefresh: 'pc_auth_refresh',
  authUser: 'pc_auth_user',
};

const API = axios.create({
  // With CRA dev proxy, this resolves to the Django server.
  baseURL: '/api/v1',
});

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const normalizeError = (err) => {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    const val = data[firstKey];
    if (Array.isArray(val) && val[0]) return val[0];
    if (typeof val === 'string') return val;
  }
  return err?.message || 'Request failed';
};

export const mockApi = {
  getCurrentAuth() {
    const token = storage.getString(KEYS.authToken);
    if (!token) return { token: null, user: null };
    const user = storage.getJson(KEYS.authUser, null);
    if (!user) return { token, user: null };
    return { token, user };
  },

  async register({ username, email, password }) {
    try {
      const res = await API.post('/auth/signup/', {
        username: (username || '').trim(),
        password,
        // backend ignores email; kept for UI compatibility
        email: (email || '').trim(),
      });

      const token = res.data?.token;
      const refresh = res.data?.refresh;
      const user = res.data?.user;
      if (!token || !user) throw new Error('Invalid signup response');

      storage.setString(KEYS.authToken, token);
      if (refresh) storage.setString(KEYS.authRefresh, refresh);
      storage.setJson(KEYS.authUser, user);

      return { token, user };
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },

  async login({ username, password }) {
    try {
      const res = await API.post('/auth/signin/', {
        username: (username || '').trim(),
        password,
      });

      const token = res.data?.token;
      const refresh = res.data?.refresh;
      const user = res.data?.user;
      if (!token || !user) throw new Error('Invalid login response');

      storage.setString(KEYS.authToken, token);
      if (refresh) storage.setString(KEYS.authRefresh, refresh);
      storage.setJson(KEYS.authUser, user);

      return { token, user };
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },

  async logout() {
    storage.remove(KEYS.authToken);
    storage.remove(KEYS.authUser);
    storage.remove(KEYS.authRefresh);
  },

  async listConversations({ token }) {
    try {
      const res = await API.get('/conversations/', authHeaders(token));
      return res.data || [];
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },

  async getConversation({ token, conversationId }) {
    try {
      const res = await API.get(`/conversations/${conversationId}/`, authHeaders(token));
      return res.data;
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },

  async createConversationWithFirstMessage({ token, message }) {
    try {
      const res = await API.post('/conversation/', { message }, authHeaders(token));
      return res.data;
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },

  async sendMessage({ token, conversationId, message }) {
    try {
      const res = await API.post(
        `/conversations/${conversationId}/messages/`,
        { message },
        authHeaders(token)
      );
      return res.data;
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  },
};
