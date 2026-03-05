import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConversationItem from '../components/ConversationItem';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ChatMessage from '../components/ChatMessage';
import { logout } from '../features/auth/authSlice';
import {
  CHAT_NEW_CONVERSATION_ID,
  clearChatErrors,
  fetchConversations,
  openConversation,
  sendMessage,
  startNewConversation,
} from '../features/chat/chatSlice';

export default function HomeScreen() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    conversations,
    activeConversationId,
    messagesByConversationId,
    status,
    error,
    sendStatus,
    sendError,
  } = useSelector((state) => state.chat);

  const [prompt, setPrompt] = useState('');

  const messages = useMemo(() => {
    return messagesByConversationId[activeConversationId] || [];
  }, [messagesByConversationId, activeConversationId]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, sendStatus]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const onNewConversation = () => {
    dispatch(startNewConversation());
    setPrompt('');
  };

  const onSelectConversation = (id) => {
    dispatch(clearChatErrors());
    dispatch(openConversation({ conversationId: id }));
  };

  const submitPrompt = (e) => {
    e.preventDefault();
    dispatch(clearChatErrors());
    dispatch(sendMessage({ conversationId: activeConversationId, message: prompt })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') setPrompt('');
    });
  };

  const doLogout = () => {
    dispatch(logout());
    // Chat slice is local; easiest is full reload (keeps quiz simple)
    window.location.href = '/login';
  };

  const isNew = activeConversationId === CHAT_NEW_CONVERSATION_ID;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__top">
          <button className="btn btn--secondary" type="button" onClick={onNewConversation}>
            + New
          </button>
          <div className="sidebar__user">
            <div className="sidebar__userName">{user?.username || 'User'}</div>
            <button className="linkBtn" type="button" onClick={doLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="sidebar__list">
          {status === 'loading' ? <Loader text="Loading conversations..." /> : null}
          {error ? <Message variant="danger">{error}</Message> : null}
          {conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeConversationId}
              onClick={() => onSelectConversation(c.id)}
            />
          ))}
        </div>
      </aside>

      <main className="chat">
        <div className="chat__header">
          <div className="chat__title">{isNew ? 'New conversation' : conversations.find((c) => c.id === activeConversationId)?.title}</div>
          <div className="chat__subtitle">Plant Care & Botany Guide only</div>
        </div>

        <div className="chat__body" ref={scrollRef}>
          {messages.length === 0 ? <EmptyState /> : null}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </div>

        <div className="chat__footer">
          {sendError ? <Message variant="danger">{sendError}</Message> : null}
          <form className="chatForm" onSubmit={submitPrompt}>
            <input
              className="chatForm__input"
              placeholder="Describe leaf symptoms, watering, and light..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="btn" type="submit" disabled={sendStatus === 'loading'}>
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
