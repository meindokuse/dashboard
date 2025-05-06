import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../assets/logo.png';
import lk from '../../assets/lk.png';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='navbar'>
      <img src={logo} alt='' className='logo'/>
      <ul>
        <Link to='/'>
          <li>Рынок валют</li>
        </Link>
      </ul>
      
      <div className='nav-right'>
        {isLoggedIn ? (
          <div className="auth-section">
            <Link to="/profile" className='profile-link'>
              <button>Личный кабинет <img src={lk} alt='' /></button>
            </Link>
            <button onClick={handleLogout} className='logout-button'>
              Выйти
            </button>
          </div>
        ) : (
          <Link to="/auth" className='login-button'>
            <button>Вход</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;