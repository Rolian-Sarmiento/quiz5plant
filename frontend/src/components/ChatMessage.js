export default function ChatMessage({ message }) {
  const role = message.role;
  const klass = role === 'user' ? 'chatMessage chatMessage--user' : 'chatMessage chatMessage--assistant';
  return (
    <div className={klass}>
      <div className="chatMessage__role">{role === 'user' ? 'You' : 'AI'}</div>
      <div className="chatMessage__content">
        {message.content}
      </div>
    </div>
  );
}
