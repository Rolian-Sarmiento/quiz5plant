import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

const NEW_CONVO_ID = '__new__';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) return thunkApi.rejectWithValue('Not authenticated');
  try {
    const conversations = await mockApi.listConversations({ token });
    return conversations;
  } catch (err) {
    return thunkApi.rejectWithValue(err?.message || 'Failed to load conversations');
  }
});

export const openConversation = createAsyncThunk(
  'chat/openConversation',
  async ({ conversationId }, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) return thunkApi.rejectWithValue('Not authenticated');
    try {
      const convo = await mockApi.getConversation({ token, conversationId });
      return convo;
    } catch (err) {
      return thunkApi.rejectWithValue(err?.message || 'Failed to open conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) return thunkApi.rejectWithValue('Not authenticated');

    const trimmed = (message || '').trim();
    if (!trimmed) return thunkApi.rejectWithValue('Message is empty');

    try {
      if (!conversationId || conversationId === NEW_CONVO_ID) {
        const convo = await mockApi.createConversationWithFirstMessage({ token, message: trimmed });
        return { mode: 'created', conversation: convo };
      }

      const result = await mockApi.sendMessage({ token, conversationId, message: trimmed });
      return { mode: 'appended', ...result };
    } catch (err) {
      return thunkApi.rejectWithValue(err?.message || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversationId: NEW_CONVO_ID,
    messagesByConversationId: {
      [NEW_CONVO_ID]: [],
    },
    status: 'idle',
    error: null,
    sendStatus: 'idle',
    sendError: null,
  },
  reducers: {
    startNewConversation(state) {
      state.activeConversationId = NEW_CONVO_ID;
      state.messagesByConversationId[NEW_CONVO_ID] = [];
      state.sendError = null;
      state.error = null;
    },
    clearChatErrors(state) {
      state.error = null;
      state.sendError = null;
    },
    clearChatState(state) {
      state.conversations = [];
      state.activeConversationId = NEW_CONVO_ID;
      state.messagesByConversationId = { [NEW_CONVO_ID]: [] };
      state.status = 'idle';
      state.error = null;
      state.sendStatus = 'idle';
      state.sendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load conversations';
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        const convo = action.payload;
        state.activeConversationId = convo.id;
        state.messagesByConversationId[convo.id] = convo.messages || [];
      })
      .addCase(openConversation.rejected, (state, action) => {
        state.error = action.payload || 'Failed to open conversation';
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = 'loading';
        state.sendError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendStatus = 'succeeded';

        if (action.payload.mode === 'created') {
          const convo = action.payload.conversation;
          state.conversations = [
            { id: convo.id, title: convo.title, createdAt: convo.createdAt, updatedAt: convo.updatedAt },
            ...state.conversations,
          ];
          state.activeConversationId = convo.id;
          state.messagesByConversationId[convo.id] = convo.messages || [];
          state.messagesByConversationId[NEW_CONVO_ID] = [];
          return;
        }

        if (action.payload.mode === 'appended') {
          const convo = action.payload.conversation;
          const existing = state.messagesByConversationId[convo.id] || [];
          state.messagesByConversationId[convo.id] = [...existing, ...(action.payload.newMessages || [])];

          state.conversations = state.conversations
            .map((c) => (c.id === convo.id ? { ...c, title: convo.title, updatedAt: convo.updatedAt } : c))
            .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = action.payload || 'Failed to send message';
      });
  },
});

export const { startNewConversation, clearChatErrors, clearChatState } = chatSlice.actions;
export const CHAT_NEW_CONVERSATION_ID = NEW_CONVO_ID;
export default chatSlice.reducer;
