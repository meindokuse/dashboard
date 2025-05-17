// Home.jsx (только статика для валют)
import React from 'react'
import './Home.css'
import CurrencyCard from '../../components/CurrencyCard/CurrencyCard'

// Статические данные валют
const STATIC_CURRENCIES = [
  { id: 1, code: "BTC", name: "Bitcoin",image:'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579' },
  { id: 2, code: "SOL", name: "Solana",image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422'},
  { id: 3, code: "ETH", name: "Ethereum",image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880' },
  { id: 4, code: "TON", name: "Toncoin",image: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png?1670498136' }
];

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
        {STATIC_CURRENCIES.map((currency) => (
          <CurrencyCard 
            key={currency.id}
            coin={{ 
              id: currency.id,
              name: currency.name,
              code: currency.code,
              image: currency.image
            }} 
          />
        ))}
      </div>
    </div>
  )
}

export default Home