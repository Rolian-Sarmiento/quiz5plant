import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormComponent from '../components/FormComponent';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { clearAuthError, register } from '../features/auth/authSlice';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    dispatch(register({ username, email, password }));
  };

  return (
    <div className="page">
      <FormComponent
        title="Register"
        onSubmit={submitHandler}
        footer={
          <div>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        }
      >
        {localError ? <Message variant="danger">{localError}</Message> : null}
        {error ? <Message variant="danger">{error}</Message> : null}
        {status === 'loading' ? <Loader text="Creating account..." /> : null}

        <label className="field">
          <span className="field__label">Username</span>
          <input className="field__input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Email (optional)</span>
          <input
            className="field__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="field__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span className="field__label">Confirm Password</span>
          <input
            className="field__input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <button className="btn" type="submit" disabled={status === 'loading'}>
          Register
        </button>
      </FormComponent>
    </div>
  );
}
