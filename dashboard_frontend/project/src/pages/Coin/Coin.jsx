import React from 'react'
import { useParams, Link } from 'react-router-dom'
import './Coin.css'


const Coin = () => {
  const { coinId } = useParams()


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
  }


  const currentCoin = coinData[coinId]


  if (!currentCoin) {
    return (
      <div className="coin-page">
        <Link to="/" className="back-button">← Назад к списку</Link>
        <h2>Криптовалюта не найдена</h2>
      </div>
    )
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
      <div className='coin-chart'>
      </div>
      <div className="description">
        <h3>Описание</h3>
        <p>{currentCoin.description}</p>
      </div>
    </div>
  )
}

export default Coin