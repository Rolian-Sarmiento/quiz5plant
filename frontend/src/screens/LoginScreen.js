import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormComponent from '../components/FormComponent';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { clearAuthError, login } from '../features/auth/authSlice';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  return (
    <div className="page">
      <FormComponent
        title="Login"
        onSubmit={submitHandler}
        footer={
          <div>
            New user? <Link to="/register">Register</Link>
          </div>
        }
      >
        {error ? <Message variant="danger">{error}</Message> : null}
        {status === 'loading' ? <Loader text="Signing in..." /> : null}

        <label className="field">
          <span className="field__label">Username</span>
          <input
            className="field__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="field__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button className="btn" type="submit" disabled={status === 'loading'}>
          Login
        </button>
      </FormComponent>
    </div>
  );
}
