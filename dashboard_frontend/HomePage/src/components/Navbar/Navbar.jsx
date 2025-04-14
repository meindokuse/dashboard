import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import arrow_icon from '../../assets/arrow_icon.png'
import { Link } from 'react-router-dom'
const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={logo} alt='' className='logo'/>
      <ul>
        <Link to='/'>
            <li>Рынок валют</li>
        </Link>
      </ul>
      <div className='nav-right'>
        <select>
            <option value="usd">USD</option>
            <option value="rub">RUB</option>
        </select>
        <Link to="/auth" className='login-button'>
            <button>Вход <img src={arrow_icon} alt='' /></button>
        </Link>
      </div>
    </div>
  )
}
export default Navbar
