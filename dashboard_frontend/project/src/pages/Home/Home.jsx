import React, { useState, useEffect } from 'react'
import './Home.css'
import CurrencyCard from '../../components/CurrencyCard/CurrencyCard'
import { API_CONFIG } from '../../config/config'

const Home = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/currencies/currencies/`);
        const data = await response.json();
        setCurrencies(data);
      } catch (err) {
        console.error('Ошибка загрузки валют:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  if (loading) return <div>Загрузка...</div>;

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
        {currencies.map((currency) => (
          <CurrencyCard 
            key={currency.id}
            coin={{ 
              id: currency.id,
              name: currency.name,
              symbol: currency.code,
            }} 
          />
        ))}
      </div>
    </div>
  )
}

export default Home