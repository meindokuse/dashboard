import React from 'react'
import Navbar from './components/Navbar/Navbar'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home/Home'
import Coin from './pages/Coin/Coin'
import Auth from './pages/Auth/Auth'
import Profile from './pages/Profile/Profile'
import PortfolioCurrencies from './pages/PortfolioCurrencies/PortfolioCurrencies';
import { AuthProvider } from "./context/AuthContext";
const App = () => {
  return (
    <AuthProvider>
    <div className='app'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/coin/:coinId' element={<Coin/>}/>
        <Route path='/auth/' element={<Auth/>}/>
        <Route path='/profile/' element={<Profile/>}/>
        <Route path="/portfolio/:portfolioId" element={<PortfolioCurrencies />} />
      </Routes>
    </div>
    </AuthProvider>
  )
}

export default App
