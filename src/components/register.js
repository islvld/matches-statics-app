import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role: 'user' }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
    } else {
      setError(data.error || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button">
            Зарегистрироваться
          </button>
        </form>
        <p className="auth-footer">
          Уже есть аккаунт? <a href="/login" className="auth-link">Войдите</a>
        </p>
      </div>
    </div>
  );
};

export default Register;