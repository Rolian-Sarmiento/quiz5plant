export default function ConversationItem({ conversation, active, onClick }) {
  return (
    <button
      type="button"
      className={active ? 'conversation conversation--active' : 'conversation'}
      onClick={onClick}
      title={conversation.title}
    >
      <div className="conversation__title">{conversation.title || 'Untitled'}</div>
    </button>
  );
}
