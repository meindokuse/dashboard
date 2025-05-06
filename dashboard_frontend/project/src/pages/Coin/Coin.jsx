import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Coin.css';
import LineChart from '../../components/LineChart/LineChart';

const Coin = () => {
  const { coinId } = useParams();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('buy');
  const [balance] = useState(100000); // Моковый баланс

  const coinData = {
    bitcoin: {
      name: "Bitcoin",
      symbol: "BTC",
      current_price: 50000,
      price_change_percentage_24h: 2.5,
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      market_cap: 987654321000,
      total_volume: 123456789000,
      description: "Первая криптовалюта в мире"
    },
    ethereum: {
      name: "Ethereum",
      symbol: "ETH",
      current_price: 3000,
      price_change_percentage_24h: -1.2,
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      market_cap: 360000000000,
      total_volume: 12000000000,
      description: "Платформа для умных контрактов"
    }
  };

  const currentCoin = coinData[coinId];

  const handleTrade = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    const total = action === 'buy' 
      ? numericAmount / currentCoin.current_price
      : numericAmount * currentCoin.current_price;

    alert(`${action === 'buy' ? 'Покупка' : 'Продажа'} успешна!\nПолучено: ${total.toFixed(6)} ${currentCoin.symbol}`);
    setAmount('');
  };

  if (!currentCoin) {
    return (
      <div className="coin-page">
        <Link to="/" className="back-button">← Назад к списку</Link>
        <h2>Криптовалюта не найдена</h2>
      </div>
    );
  }

  return (
    <div className="coin-page">
      <Link to="/" className="back-button">← Назад к списку</Link>
      
      <div className="coin-header">
        <img src={currentCoin.image} alt={currentCoin.name} className="coin-logo" />
        <h1>{currentCoin.name} ({currentCoin.symbol})</h1>
      </div>

      <div className="price-info">
        <h2>${currentCoin.current_price.toLocaleString()}</h2>
        <p className={currentCoin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
          {currentCoin.price_change_percentage_24h}%
        </p>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span>Капитализация:</span>
          <span>${currentCoin.market_cap.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span>Объем (24ч):</span>
          <span>${currentCoin.total_volume.toLocaleString()}</span>
        </div>
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
              Сумма ({action === 'buy' ? 'USD' : currentCoin.symbol})
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
            {action === 'buy' ? 'Купить' : 'Продать'} {currentCoin.symbol}
          </button>
        </form>
      </div>

      <div className="description">
        <h3>Описание</h3>
        <p>{currentCoin.description}</p>
      </div>

      <LineChart />
    </div>
  );
};

export default Coin;