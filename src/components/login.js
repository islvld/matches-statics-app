import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      navigate('/');
    } else {
      setError(data.error || 'Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>
        <p className="auth-footer">
          Нет аккаунта? <a href="/register" className="auth-link">Зарегистрируйтесь</a>
        </p>
      </div>
    </div>
  );
};

export default Login;