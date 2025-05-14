import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './PortfolioCurrencies.css';
import { API_CONFIG } from '../../config/config';

const STATIC_CURRENCIES = [
  { id: 1, code: 'BTC', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579' },
  { id: 2, code: 'SOL', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422' },
  { id: 3, code: 'ETH', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880' },
  { id: 4, code: 'TON', name: 'Toncoin', image: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png?1670498136' },
];

const CurrencyCard = ({ currency, onActionClick, isPurchased }) => {
  return (
    <div className="currency-card">
      <div className="currency-image-container">
        <img src={currency.image} alt={currency.name} className="currency-image" />
        <div className="currency-info">
          <h3 className="currency-name">{currency.name}</h3>
          {isPurchased ? (
            <>
              <p className="currency-amount">Количество: {currency.amount?.toFixed(4) || '0'}</p>
              <p className="currency-buy-price">Стоимость: ₽{currency.currentValue?.toFixed(2) || '0.00'}</p>
              <p
                className={`currency-profit ${
                  currency.profitPercentage > 0 ? 'profit' : 
                  currency.profitPercentage < 0 ? 'loss' : 'neutral'
                }`}
              >
                {currency.profitPercentage >= 0 ? 'Прибыль' : 'Убыток'}: {currency.profitPercentage?.toFixed(2) || '0.00'}%
              </p>
            </>
          ) : (
            <p className="currency-not-purchased">Монета не приобретена</p>
          )}
        </div>
      </div>
      <div className="currency-actions">
        <button
          className="buy-button"
          onClick={() => onActionClick(currency.code, 'buy')}
        >
          Купить
        </button>
        {isPurchased && (
          <button
            className="sell-button"
            onClick={() => onActionClick(currency.code, 'sell')}
          >
            Продать
          </button>
        )}
      </div>
    </div>
  );
};

const TransactionItem = ({ transaction }) => {
  const isBuy = transaction.type.toLowerCase() === 'buy';
  const transactionClass = isBuy ? 'transaction-item buy' : 'transaction-item sell';
  
  const currency = STATIC_CURRENCIES.find(c => c.id === transaction.currency_id);
  
  // Предполагаем, что timestamp приходит как строка ISO (например, "2025-05-14T23:28:00")
  const formattedDate = new Date(transaction.timestamp).toLocaleString('ru-RU');

  return (
    <div className={transactionClass}>
      <div className="transaction-header">
        <span className={`transaction-type ${isBuy ? 'buy' : 'sell'}`}>
          {isBuy ? 'Покупка' : 'Продажа'}
        </span>
        <span className="transaction-date">{formattedDate}</span>
      </div>
      <div className="transaction-details">
        <div className="transaction-detail">
          <span className="transaction-detail-label">Валюта</span>
          <span className="transaction-detail-value">{currency?.name || 'Неизвестно'}</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Количество</span>
          <span className="transaction-detail-value">{transaction.amount.toFixed(4)} шт.</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Цена</span>
          <span className="transaction-detail-value">₽{transaction.rate.toFixed(2)}</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Сумма</span>
          <span className="transaction-detail-value">₽{(transaction.amount * transaction.rate).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const PortfolioCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { portfolioId } = useParams();
  const { state } = useLocation();
  const portfolioName = state?.portfolioName || `Портфель ${portfolioId}`;

  const handleActionClick = (currencyCode, action) => {
    navigate(`/coin/${currencyCode}`, {
      state: {
        portfolioId,
        action,
      },
    });
  };

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const sessionId = localStorage.getItem('session_id');

      // Устанавливаем portfolio
      setPortfolio({
        id: portfolioId,
        name: portfolioName,
      });

      // Запрос позиций портфеля
      const positionsResponse = await fetch(`${API_CONFIG.BASE_URL}/portfolio/${portfolioId}/portfolio_positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      // Запрос данных о профите портфеля
      const profitResponse = await fetch(`${API_CONFIG.BASE_URL}/portfolio/portfolio_profit?portfolio_id=${portfolioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      let positionsData = [];
      let profitData = null;

      if (positionsResponse.ok) {
        positionsData = await positionsResponse.json();
      }

      if (profitResponse.ok) {
        profitData = await profitResponse.json();
        setPortfolioSummary(profitData.summary);
      }

      // Обработка позиций портфеля
      const userCurrencies = STATIC_CURRENCIES.map((staticCurrency) => {
        const position = positionsData.find((p) => p.currency_id === staticCurrency.id);
        const profitPosition = profitData?.positions.find((p) => p.currency === staticCurrency.code);
        
        if (position && profitPosition) {
          return {
            ...staticCurrency,
            amount: position.amount,
            currentValue: profitPosition.current_value,
            profitPercentage: profitPosition.profit_percent,
            isPurchased: true,
          };
        }
        return {
          ...staticCurrency,
          amount: 0,
          currentValue: 0,
          profitPercentage: 0,
          isPurchased: false,
        };
      });
      setCurrencies(userCurrencies);

      // Запрос транзакций
      const transactionsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/transaction/transactions?portfolio_id=${portfolioId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-session-id': sessionId || '',
          },
          credentials: 'include',
        }
      );

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const fetchedTransactions = Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData.transactions || [];
        setTransactions(fetchedTransactions.reverse());
      } else if (transactionsResponse.status !== 404) {
        throw new Error('Ошибка при загрузке транзакций');
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [portfolioId]);

  if (isLoading) {
    return <div>Загрузка данных портфеля...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!portfolio) {
    return <div>Данные портфеля не найдены</div>;
  }

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1>{portfolio.name}</h1>
        {portfolioSummary && (
          <div className="portfolio-summary">
            <p>Стоимость портфеля: ₽{portfolioSummary.total_current_value.toFixed(2)}</p>
            <p className={`portfolio-profit ${
              portfolioSummary.total_profit_percent > 0 ? 'profit' : 
              portfolioSummary.total_profit_percent < 0 ? 'loss' : 'neutral'
            }`}>
              Прибыль портфеля: {portfolioSummary.total_profit_percent.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      <div className="crypto-dashboard">
        <div className="currency-cards-container">
          {currencies.map((currency) => (
            <CurrencyCard
              key={currency.id}
              currency={currency}
              onActionClick={handleActionClick}
              isPurchased={currency.isPurchased}
            />
          ))}
        </div>

        <div className="transactions-container">
          <h2>История транзакций</h2>
          <div className="transactions-list">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p>Транзакции отсутствуют</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCurrencies;