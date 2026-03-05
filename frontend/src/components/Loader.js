export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      {text}
    </div>
  );
}
