import React from 'react'
import './CurrencyCard.css'
import { Link } from 'react-router-dom'

const CurrencyCard = ({ coin }) => {
  return (
    <Link to={`/coin/${coin.code}`} className='currency-card1'>
      <div className="card-header">
        <h3>{coin.name}</h3>
        <span>{coin.symbol.toUpperCase()}</span>
      </div>
      <div className="card-body">
        <p>Код: {coin.code}</p>
      </div>
    </Link>
  )
}

export default CurrencyCard