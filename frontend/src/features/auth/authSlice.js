import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

const initialAuth = mockApi.getCurrentAuth();

export const login = createAsyncThunk('auth/login', async ({ username, password }, thunkApi) => {
  try {
    return await mockApi.login({ username, password });
  } catch (err) {
    return thunkApi.rejectWithValue(err?.message || 'Login failed');
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, thunkApi) => {
    try {
      return await mockApi.register({ username, email, password });
    } catch (err) {
      return thunkApi.rejectWithValue(err?.message || 'Register failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await mockApi.logout();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialAuth.token,
    user: initialAuth.user,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Register failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
