import React, { useState } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import arrow_icon from '../../assets/arrow_icon.png'
import lk from '../../assets/lk.png'
import { Link } from 'react-router-dom'

const Navbar = () => {
  // Временное состояние(false - "вход", true - "личный кабинет")
  const [isLoggedIn, setIsLoggedIn] = useState(true)

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
          <Link to="/profile" className='profile-link'>
            <button>Личный кабинет <img src={lk} alt='' /></button>
          </Link>
        ) : (
          <Link to="/auth" className='login-button'>
            <button>Вход <img src={arrow_icon} alt='' /></button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Navbar