import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [currencyData, setCurrencyData] = useState(null);
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState('Выбрать портфель');
  const [showPortfolioMenu, setShowPortfolioMenu] = useState(false);

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

        // Проверка авторизации и получение портфелей
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

          setIsAuthenticated(true);

          // Получение портфелей
          const portfoliosRes = await fetch(`${API_CONFIG.BASE_URL}/portfolio/portfolios?page=1&limit=100`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'x-session-id': sessionId || '',
            },
            credentials: 'include',
          });

          if (!portfoliosRes.ok) throw new Error('Ошибка при загрузке портфелей');
          const portfoliosData = await portfoliosRes.json();
          const portfoliosArray = Array.isArray(portfoliosData) ? portfoliosData : [portfoliosData];
          setPortfolios(portfoliosArray);
        } else {
          setIsAuthenticated(false);
        }

        setCurrencyData(currentCurrency);
        setCurrentRate(latestRate);
      } catch (err) {
        setError(err.message);
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId]);

  const handlePortfolioSelect = (portfolio) => {
    setSelectedPortfolioId(portfolio.id);
    setSelectedPortfolioName(portfolio.name);
    setShowPortfolioMenu(false);
  };

  const handleCreatePortfolio = () => {
    navigate('/profile');
  };

  const handleTradeRedirect = (action) => {
    if (!selectedPortfolioId) {
      alert('Пожалуйста, выберите портфель');
      return;
    }
    navigate(`/portfolio/${selectedPortfolioId}`, {
      state: { portfolioName: selectedPortfolioName, coinId, action },
    });
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

      {isAuthenticated ? (
        <div className="portfolio-section">
          {portfolios.length > 0 ? (
            <>
              <div className="portfolio-selector">
                <label>Портфель</label>
                <div className="portfolio-dropdown">
                  <button
                    type="button"
                    className="portfolio-btn"
                    onClick={() => setShowPortfolioMenu(!showPortfolioMenu)}
                  >
                    {selectedPortfolioName}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showPortfolioMenu && (
                    <div className="portfolio-menu">
                      {portfolios.map((portfolio) => (
                        <div
                          key={portfolio.id}
                          className="portfolio-menu-item"
                          onClick={() => handlePortfolioSelect(portfolio)}
                        >
                          {portfolio.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedPortfolioId && (
                <div className="trade-actions">
                  <button
                    className="trade-btn buy-sell"
                    onClick={() => handleTradeRedirect('buy-sell')}
                  >
                    Купить/Продать {currencyData.code}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-portfolios">
              <span onClick={handleCreatePortfolio} className="create-portfolio-link">
                Создать портфель +
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-hint">
          <p>
            Авторизуйтесь, чтобы купить или продать валюту.{' '}
            <Link to="/auth">Войти</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Coin;