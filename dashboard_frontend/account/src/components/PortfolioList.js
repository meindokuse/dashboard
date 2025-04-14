import React from 'react';
import '../styles/PortfolioList.css';

function PortfolioList({ portfolios }) {
  return (
    <div className="portfolio-section">
      <h2>Мои портфели</h2>
      <div className="portfolio-grid">
        {portfolios.map(portfolio => (
          <div key={portfolio.id} className="portfolio-card">
            <h3>{portfolio.name}</h3>
            <p>Стоимость: ${portfolio.value.toFixed(2)}</p>
            <p className={portfolio.profit >= 0 ? 'profit' : 'loss'}>
              Прибыль: ${portfolio.profit.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioList;