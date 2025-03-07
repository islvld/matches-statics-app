import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav>
      <Link to="/">Главная</Link>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Выйти</button>
      ) : (
        <Link to="/register">Зарегистрироваться</Link>
      )}
    </nav>
  );
};

export default Navbar;