import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PortfolioCurrencies.css';
import { API_CONFIG } from '../../config/config';
import AlertPortfolio from '../../components/AlertPortfolio/AlertPortfolio'; // Импорт компонента уведомлений

const STATIC_CURRENCIES = [
  { id: 1, code: 'BTC', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579' },
  { id: 2, code: 'SOL', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422' },
  { id: 3, code: 'ETH', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880' },
  { id: 4, code: 'TON', name: 'Toncoin', image: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png?1670498136' },
];

const PortfolioCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [actionStates, setActionStates] = useState({});
  const { portfolioId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const portfolioName = state?.portfolioName || `Портфель ${portfolioId}`;

  const handleActionClick = (currencyId, selectedAction) => {
    setActionStates((prev) => ({
      ...prev,
      [currencyId]: {
        ...prev[currencyId],
        action: prev[currencyId]?.action === selectedAction ? null : selectedAction,
        amount: '',
        error: null,
      },
    }));
  };

  const handleAmountChange = (currencyId, value) => {
    if (value === '' || (parseFloat(value) > -0.9999 && !isNaN(value))) {
      setActionStates((prev) => ({
        ...prev,
        [currencyId]: {
          ...prev[currencyId],
          amount: value,
          error: null,
        },
      }));
    } else {
      setActionStates((prev) => ({
        ...prev,
        [currencyId]: {
          ...prev[currencyId],
          error: 'Введите корректное количество',
        },
      }));
    }
  };

  const handleSubmit = async (currency, action, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      setActionStates((prev) => ({
        ...prev,
        [currency.id]: {
          ...prev[currency.id],
          error: 'Введите корректное количество',
        },
      }));
      return;
    }

    if (action === 'sell' && parseFloat(amount) > currency.amount) {
      setActionStates((prev) => ({
        ...prev,
        [currency.id]: {
          ...prev[currency.id],
          error: 'Нельзя продать больше, чем имеется',
        },
      }));
      return;
    }

    setActionStates((prev) => ({
      ...prev,
      [currency.id]: {
        ...prev[currency.id],
        isSubmitting: true,
      },
    }));

    try {
      const sessionId = localStorage.getItem('session_id');
      let url, method, body;

      if (!currency.isPurchased && action === 'buy') {
        url = `${API_CONFIG.BASE_URL}/portfolio/create_position`;
        method = 'POST';
        body = {
          portfolio_id: parseInt(portfolioId),
          currency_id: currency.id,
          amount: parseFloat(amount),
        };
      } else {
        url = `${API_CONFIG.BASE_URL}/portfolio/update_position`;
        method = 'PUT';
        body = {
          id: currency.positionId,
          type: action,
          amount: parseFloat(amount),
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      setActionStates((prev) => ({
        ...prev,
        [currency.id]: {
          action: null,
          amount: '',
          error: null,
          isSubmitting: false,
        },
      }));
      await fetchPortfolioData();
    } catch (err) {
      setActionStates((prev) => ({
        ...prev,
        [currency.id]: {
          ...prev[currency.id],
          error: err.message,
          isSubmitting: false,
        },
      }));
    }
  };

  const handleLogoClick = (coinCode) => {
    navigate(`/coin/${coinCode}`);
  };

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const sessionId = localStorage.getItem('session_id');

      setPortfolio({
        id: portfolioId,
        name: portfolioName,
      });

      const ratesResponse = await fetch(`${API_CONFIG.BASE_URL}/rate/last_rates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      let lastRates = {};
      if (ratesResponse.ok) {
        lastRates = await ratesResponse.json();
      } else {
        console.warn('Не удалось загрузить курсы монет');
      }

      const positionsResponse = await fetch(`${API_CONFIG.BASE_URL}/portfolio/${portfolioId}/portfolio_positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

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
      } else {
        console.warn('Не удалось загрузить позиции портфеля');
      }

      if (profitResponse.ok) {
        profitData = await profitResponse.json();
        setPortfolioSummary(profitData?.summary || null);
      } else {
        console.warn('Не удалось загрузить данные о прибыли');
      }

      const userCurrencies = STATIC_CURRENCIES.map((staticCurrency) => {
        const position = positionsData.find((p) => p.currency_id === staticCurrency.id);
        const profitPosition = profitData?.positions?.find((p) => p.currency === staticCurrency.code);
        const currentRate = lastRates[staticCurrency.code] || 0;

        if (position && profitPosition) {
          return {
            ...staticCurrency,
            amount: position.amount,
            currentValue: profitPosition.current_value,
            profitPercentage: profitPosition.profit_percent,
            isPurchased: true,
            positionId: position.id,
            currentPrice: currentRate || profitPosition.current_value / position.amount || 0,
          };
        }
        return {
          ...staticCurrency,
          amount: 0,
          currentValue: 0,
          profitPercentage: 0,
          isPurchased: false,
          currentPrice: currentRate,
        };
      });
      setCurrencies(userCurrencies);

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
      console.error('Ошибка загрузки данных портфеля:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [portfolioId]);

  const TransactionItem = ({ transaction }) => {
    const isBuy = transaction.type.toLowerCase() === 'buy';
    const transactionClass = isBuy ? 'transaction-item buy' : 'transaction-item sell';
    const currency = STATIC_CURRENCIES.find((c) => c.id === transaction.currency_id);
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
        <div className="alert-button-container">
          <button className="alert-btn" onClick={() => setShowAlertModal(true)}>
            Настроить уведомления
          </button>
        </div>
        {portfolioSummary && (
          <div className="portfolio-summary">
            <p>Стоимость портфеля: ₽{portfolioSummary.total_current_value?.toFixed(2) || '0.00'}</p>
            <p
              className={`portfolio-profit ${
                portfolioSummary.total_profit_percent > 0
                  ? 'profit'
                  : portfolioSummary.total_profit_percent < 0
                  ? 'loss'
                  : 'neutral'
              }`}
            >
              Прибыль портфеля: {portfolioSummary.total_profit_percent?.toFixed(2) || '0.00'}%
            </p>
          </div>
        )}
      </div>

      {showAlertModal

 && (
        <AlertPortfolio
          portfolioId={portfolioId}
          onClose={() => setShowAlertModal(false)}
        />
      )}

      <div className="crypto-dashboard">
        <div className="currency-cards-container">
          {currencies.map((currency) => {
            const actionState = actionStates[currency.id] || {};
            const totalCost = actionState.amount
              ? (parseFloat(actionState.amount) * currency.currentPrice).toFixed(2)
              : '0.00'; // Исправлено: hastag('0.00') → '0.00'

            return (
              <div key={currency.id} className="currency-card">
                <div className="currency-image-container">
                  <img
                    src={currency.image}
                    alt={currency.name}
                    className="currency-image"
                    onClick={() => handleLogoClick(currency.code)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="currency-info">
                    <h3 className="currency-name">{currency.name}</h3>
                    <p className="currency-price">Текущая цена: ₽{currency.currentPrice.toFixed(2)}</p>
                    {currency.isPurchased ? (
                      <>
                        <p className="currency-amount">Количество: {currency.amount?.toFixed(4) || '0'}</p>
                        <p className="currency-buy-price">Стоимость: ₽{currency.currentValue?.toFixed(2) || '0.00'}</p>
                        <p
                          className={`currency-profit ${
                            currency.profitPercentage > 0
                              ? 'profit'
                              : currency.profitPercentage < 0
                              ? 'loss'
                              : 'neutral'
                          }`}
                        >
                          {currency.profitPercentage >= 0 ? 'Прибыль' : 'Убыток'}:{' '}
                          {currency.profitPercentage?.toFixed(2) || '0.00'}%
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
                    onClick={() => handleActionClick(currency.id, 'buy')}
                    disabled={actionState.isSubmitting}
                  >
                    Купить
                  </button>
                  {currency.isPurchased && (
                    <button
                      className="sell-button"
                      onClick={() => handleActionClick(currency.id, 'sell')}
                      disabled={actionState.isSubmitting}
                    >
                      Продать
                    </button>
                  )}
                </div>
                {actionState.action && (
                  <div className="action-form">
                    <div className="action-input-container">
                      <label htmlFor={`amount-input-${currency.id}`}>Количество:</label>
                      <input
                        id={`amount-input-${currency.id}`}
                        type="number"
                        step="0.0001"
                        min="0"
                        value={actionState.amount || ''}
                        onChange={(e) => handleAmountChange(currency.id, e.target.value)}
                        placeholder="Введите количество"
                        disabled={actionState.isSubmitting}
                      />
                    </div>
                    <p className="total-cost">Стоимость: ₽{totalCost}</p>
                    {actionState.error && <p className="error-message">{actionState.error}</p>}
                    <button
                      className="confirm-button"
                      onClick={() => handleSubmit(currency, actionState.action, actionState.amount)}
                      disabled={
                        actionState.isSubmitting ||
                        !actionState.amount ||
                        parseFloat(actionState.amount) <= 0
                      }
                    >
                      {actionState.isSubmitting
                        ? 'Выполняется...'
                        : `Подтвердить ${actionState.action === 'buy' ? 'покупку' : 'продажу'}`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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