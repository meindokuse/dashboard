import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Coin.css';
import LineChart from '../../components/LineChart/LineChart';
import { API_CONFIG } from '../../config/config';

const Coin = () => {
  const { coinId } = useParams(); // coinId теперь равен currency.code (например, "BTC")
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('buy');
  const [currencyData, setCurrencyData] = useState(null);
  const [currentRate, setCurrentRate] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка данных о валюте и балансе пользователя
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Получение информации о валюте
        const currencyRes = await fetch(`${API_CONFIG.BASE_URL}/currencies/currencies/`);
        const currencies = await currencyRes.json();
        const currentCurrency = currencies.find(c => c.code === coinId);
        if (!currentCurrency) throw new Error('Валюта не найдена');

        // 2. Получение последнего курса
        const rateRes = await fetch(
          `${API_CONFIG.BASE_URL}/rate/currencies/${coinId}/rates/?` + 
          new URLSearchParams({
            start_date: new Date(Date.now() - 3600 * 1000).toISOString(), // последний час
            end_date: new Date().toISOString()
          })
        );
        const rateData = await rateRes.json();
        const latestRate = rateData.rates[0]?.rate || 0;

        // 3. Получение баланса пользователя (пример для авторизованных запросов)
        const profileRes = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const profileData = await profileRes.json();

        setCurrencyData(currentCurrency);
        setCurrentRate(latestRate);
        setBalance(profileData.balance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId]);

  const handleTrade = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      // Отправка транзакции на бэкенд
      const response = await fetch(API_CONFIG.BASE_URL + '/transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currency_id: currencyData.id,
          type: action.toUpperCase(),
          amount: numericAmount,
          rate: currentRate,
          portfolio_id: 1 // Пример, нужно заменить на реальный portfolio_id
        })
      });

      if (!response.ok) throw new Error('Ошибка транзакции');
      alert('Транзакция успешно выполнена!');
      setAmount('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="coin-page">Загрузка...</div>;
  if (error) return <div className="coin-page">Ошибка: {error}</div>;

  return (
    <div className="coin-page">
      <Link to="/" className="back-button">← Назад к списку</Link>
      
      <div className="coin-header">
        <h1>{currencyData.name} ({currencyData.code})</h1>
      </div>

      <div className="price-info">
        <h2>${currentRate.toLocaleString()}</h2>
      </div>

      <div className="trading-section">
        <h3>Торговая панель</h3>
        <div className="action-switcher">
          <button
            className={`trade-btn ${action === 'buy' ? 'active' : ''}`}
            onClick={() => setAction('buy')}
          >
            Купить
          </button>
          <button
            className={`trade-btn ${action === 'sell' ? 'active' : ''}`}
            onClick={() => setAction('sell')}
          >
            Продать
          </button>
        </div>

        <form onSubmit={handleTrade} className="trade-form">
          <div className="balance-info">
            Доступно: ${balance.toLocaleString()}
          </div>

          <div className="input-group">
            <label>
              Сумма ({action === 'buy' ? 'USD' : currencyData.code})
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                placeholder="0.00"
                required
              />
            </label>
          </div>

          <button type="submit" className={`submit-btn ${action}`}>
            {action === 'buy' ? 'Купить' : 'Продать'} {currencyData.code}
          </button>
        </form>
      </div>

      <div className="description">
        <h3>Описание</h3>
        <p>{currencyData.description}</p>
      </div>

      <LineChart />
    </div>
  );
};

export default Coin;