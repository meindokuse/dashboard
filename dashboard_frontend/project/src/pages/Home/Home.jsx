import React from 'react'
import './Home.css'
import CurrencyCard from '../../components/CurrencyCard/CurrencyCard'
import { mockCoins } from '../../data/mockCoins'

const Home = () => {
  return (
    <div className='home'>
      <div className='hero'>
        <h1>ШкельКоин: <br/> анализ рынка валют</h1>
        <p>Добро пожаловать на наш сайт! Здесь вы можете анализировать валюты, а также покупать и продавать их!</p>
        <form>
          <input type='text' placeholder='Искать валюты...' />
          <button type='submit'>Искать</button>
        </form>
      </div>
      
      <div className='currency-grid'>
        {mockCoins.map((coin) => (
          <CurrencyCard 
            key={`${coin.id}-${coin.symbol}`} 
            coin={coin} 
          />
        ))}
      </div>
    </div>
  )
}

export default Home