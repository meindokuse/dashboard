import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Coin.css';
import LineChart from '../../components/LineChart/LineChart';
import { API_CONFIG } from '../../config/config';

const STATIC_CURRENCIES = [
  { id: 1, code: 'BTC', name: 'Bitcoin', description: 'Первая и крупнейшая криптовалюта, основанная на блокчейне.' },
  { id: 2, code: 'SOL', name: 'Solana', description: 'Высокопроизводительный блокчейн для масштабируемых приложений.' },
  { id: 3, code: 'ETH', name: 'Ethereum', description: 'Платформа для смарт-контрактов и децентрализованных приложений.' },
  { id: 4, code: 'TON', name: 'Toncoin', description: 'Криптовалюта, разработанная для экосистемы Telegram.' },
];

const Coin = () => {
  const { coinId } = useParams();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('buy');
  const [currencyData, setCurrencyData] = useState(null);
  const [currentRate, setCurrentRate] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Поиск валюты
        const currentCurrency = STATIC_CURRENCIES.find((c) => c.code === coinId);
        if (!currentCurrency) throw new Error('Валюта не найдена');

        // Курс
        const rateRes = await fetch(`${API_CONFIG.BASE_URL}/rate/last_rates`);
        if (!rateRes.ok) throw new Error('Ошибка получения курса');
        const lastRates = await rateRes.json();
        const latestRate = lastRates[coinId] || 0;

        // Проверка авторизации и получение баланса
        let userBalance = 0;
        const sessionId = localStorage.getItem('session_id');
        if (sessionId) {
          const profileRes = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'x-session-id': sessionId || '',
            },
            credentials: 'include',
            body: JSON.stringify({}),
          });

          if (profileRes.status === 401) {
            localStorage.removeItem('session_id');
            setIsAuthenticated(false);
            throw new Error('Не авторизован. Пожалуйста, войдите снова.');
          }

          if (!profileRes.ok) {
            const errorData = await profileRes.json().catch(() => ({}));
            throw new Error(errorData.message || `Ошибка HTTP! Статус: ${profileRes.status}`);
          }

          const profileData = await profileRes.json();
          userBalance = profileData.user ? parseFloat(profileData.user.balance) || 0 : 0;
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }

        setCurrencyData(currentCurrency);
        setCurrentRate(latestRate);
        setBalance(userBalance);
      } catch (err) {
        setError(err.message);
        console.error('Ошибка при загрузке данных:', err);
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
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_CONFIG.BASE_URL}/transaction/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          currency_id: currencyData.id,
          type: action.toUpperCase(),
          amount: numericAmount,
          rate: currentRate,
          portfolio_id: 1,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('session_id');
        setIsAuthenticated(false);
        throw new Error('Не авторизован. Пожалуйста, войдите снова.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка транзакции');
      }

      alert('Транзакция успешна!');
      setAmount('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="coin-page">Загрузка...</div>;
  if (error) return <div className="coin-page">Ошибка: {error}</div>;

  return (
    <div className="coin-page">
      <Link to="/" className="back-button">
        ← Назад к списку
      </Link>

      <div className="coin-header">
        <h1>
          {currencyData.name} ({currencyData.code})
        </h1>
      </div>

      <div className="price-info">
        <h2>RUB {currentRate.toLocaleString()}</h2>
      </div>

      <LineChart />

      <div className="description">
        <h3>Описание</h3>
        <p>{currencyData.description}</p>
      </div>

      {isAuthenticated && (
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
            <div className="balance-info">Доступно: ₽ {balance.toLocaleString()}</div>

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
      )}

      {!isAuthenticated && (
        <div className="auth-hint">
          <p>
            Хотите торговать? <Link to="/auth">Войдите в аккаунт</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Coin;