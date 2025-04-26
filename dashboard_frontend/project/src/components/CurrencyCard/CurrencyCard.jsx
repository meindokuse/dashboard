import React from 'react'
import './CurrencyCard.css'
import { Link } from 'react-router-dom'

const CurrencyCard = ({ coin }) => {
  return (
    <Link to={`/coin/${coin.id}`} className='currency-card'>
      <div className="card-header">
        <img src={coin.image} alt={coin.name} />
        <h3>{coin.name}</h3>
        <span>{coin.symbol.toUpperCase()}</span>
      </div>
      <div className="card-body">
        <p>${coin.current_price}</p>
        <p className={coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
          {coin.price_change_percentage_24h?.toFixed(2)}%
        </p>
      </div>
    </Link>
  )
}

export default CurrencyCard