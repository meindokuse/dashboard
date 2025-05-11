import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PortfolioList.css';
import { API_CONFIG } from "../../config/config";

function PortfolioList() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        // Здесь нужно добавить токен аутентификации, если требуется
        const response = await fetch(`${API_CONFIG.BASE_URL}/portfolios`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // пример, если используется JWT
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке портфелей');
        }
        
        const data = await response.json();
        setPortfolios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handlePortfolioClick = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };

  if (loading) {
    return <div className="portfolio-section">Загрузка портфелей...</div>;
  }

  if (error) {
    return <div className="portfolio-section">Ошибка: {error}</div>;
  }

  return (
    <div className="portfolio-section">
      <h2>Мои портфели</h2>
      <div className="portfolio-grid">
        {portfolios.map(portfolio => (
          <div 
            key={portfolio.id} 
            className="portfolio-card"
            onClick={() => handlePortfolioClick(portfolio.id)}
          >
            <h3>{portfolio.name}</h3>
            <p>Дата создания: {new Date(portfolio.created_date).toLocaleDateString()}</p>
            {/* Добавьте другие поля, если они есть в ответе сервера */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioList;