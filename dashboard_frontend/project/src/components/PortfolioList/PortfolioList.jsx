import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PortfolioList.css';
import { API_CONFIG } from '../../config/config';

function PortfolioList() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const fetchPortfolios = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      const { page, limit } = pagination;

      const response = await fetch(`${API_CONFIG.BASE_URL}/portfolio/portfolios?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке портфелей');
      }

      const data = await response.json();
      console.log('portfolios data:', data); // Для отладки
      const portfoliosData = Array.isArray(data) ? data : [data];
      setPortfolios(portfoliosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [pagination]);

  const handlePortfolioClick = (portfolioId, portfolioName) => {
    navigate(`/portfolio/${portfolioId}`, {
      state: { portfolioName },
    });
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    try {
      const sessionId = localStorage.getItem('session_id');

      const url = new URL(`${API_CONFIG.BASE_URL}/portfolio/create`);
      url.searchParams.append('name', portfolioName);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании портфеля');
      }

      const newPortfolioId = await response.json();

      const newPortfolio = {
        id: newPortfolioId,
        user_id: sessionId,
        name: portfolioName,
        created_at: new Date().toISOString(),
      };

      setPortfolios((prevPortfolios) => [newPortfolio, ...prevPortfolios]);

      setPortfolioName('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="portfolio-section">Загрузка портфелей...</div>;
  }

  if (error) {
    return <div className="portfolio-section">Ошибка: {error}</div>;
  }

  return (
    <div className="portfolio-section">
      <div className="portfolio-header">
        <h2>Мои портфели</h2>
        <div className="create-portfolio-wrapper">
          <button
            className="create-portfolio-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Отмена' : 'Создать портфель'}
          </button>
          {showCreateForm && (
            <form onSubmit={handleCreatePortfolio} className="create-portfolio-form">
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Название портфеля"
                className="create-portfolio-input"
                required
              />
              <button type="submit" className="create-portfolio-submit">
                Создать
              </button>
            </form>
          )}
        </div>
      </div>

      {portfolios.length > 0 ? (
        <div className="portfolio-grid">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="portfolio-card"
              onClick={() => handlePortfolioClick(portfolio.id, portfolio.name)} // Исправлено
            >
              <h3>{portfolio.name}</h3>
              <p>Дата создания: {new Date(portfolio.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-portfolios-message">
          <p>У вас пока нет портфелей</p>
        </div>
      )}
    </div>
  );
}

export default PortfolioList;