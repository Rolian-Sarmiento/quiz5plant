export default function FormComponent({ title, onSubmit, children, footer }) {
  return (
    <div className="card">
      {title ? <h1 className="card__title">{title}</h1> : null}
      <form onSubmit={onSubmit} className="form">
        {children}
      </form>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </div>
  );
}
