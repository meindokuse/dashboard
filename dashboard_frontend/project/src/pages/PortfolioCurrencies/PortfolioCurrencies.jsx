import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PortfolioCurrencies.css';
import { mockProfileData } from '../../data/mockProfile';
import { mockCase } from '../../data/mockCase';

// Исправленные пути импортов (предполагаем, что assets находится в src/assets)
import euroImage from '../../assets/euro.png';
import yuanImage from '../../assets/yuan.png';
import dollarImage from '../../assets/dollar.png';
import bitcoinImage from '../../assets/bitcoin.png';
import defaultCurrencyImage from '../../assets/default-currency.png';

const CurrencyCard = ({ currency, onBuyClick }) => {
  if (!currency || !currency.amount) {
    return (
      <div className="currency-card">
        <img src={currency?.image || defaultCurrencyImage} alt={currency?.name || 'Валюта'} className="currency-image" />
        <h3>{currency?.name || 'Валюта'}</h3>
        <p>У вас нет этой валюты</p>
        <button 
          className="buy-button"
          onClick={() => onBuyClick(currency?.symbol || '')}
        >
          Купить
        </button>
      </div>
    );
  }

  const profit = (currency.currentPrice - currency.buyPrice) * currency.amount;
  const profitPercentage = ((currency.currentPrice - currency.buyPrice) / currency.buyPrice) * 100;

  return (
    <div className="currency-card">
      <img src={currency.image} alt={currency.name} className="currency-image" />
      <h3>{currency.name}</h3>
      <p>Количество: {currency.amount}</p>
      <p>Цена за 1: ${currency.buyPrice.toFixed(2)}</p>
      <p>Текущая цена: ${currency.currentPrice.toFixed(2)}</p>
      <p className={profit >= 0 ? 'profit' : 'loss'}>
        {profit >= 0 ? 'Прибыль' : 'Убыток'}: ${Math.abs(profit).toFixed(2)} ({profitPercentage.toFixed(2)}%)
      </p>
    </div>
  );
};

const TransactionItem = ({ transaction }) => {
  const isBuy = transaction.type.toLowerCase() === 'покупка';
  const transactionClass = isBuy ? 'transaction-item buy' : 'transaction-item sell';
  
  return (
    <div className={transactionClass}>
      <div className="transaction-header">
        <span className={`transaction-type ${isBuy ? 'buy' : 'sell'}`}>
          {transaction.type}
        </span>
        <span className="transaction-date">{transaction.date}</span>
      </div>
      <div className="transaction-details">
        <div className="transaction-detail">
          <span className="transaction-detail-label">Валюта</span>
          <span className="transaction-detail-value">{transaction.currency}</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Количество</span>
          <span className="transaction-detail-value">{transaction.amount} шт.</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Цена</span>
          <span className="transaction-detail-value">${transaction.price.toFixed(2)}</span>
        </div>
        <div className="transaction-detail">
          <span className="transaction-detail-label">Сумма</span>
          <span className="transaction-detail-value">${transaction.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const PortfolioCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { portfolioId } = useParams();

  const handleBuyClick = (currencySymbol) => {
    const coinId = currencySymbol;
    navigate(`/coin/${coinId}`, {
      state: { 
        portfolioId, 
        action: 'buy'
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    
    const portfolioData = mockProfileData.portfolios.find(p => p.id.toString() === portfolioId);
    setPortfolio(portfolioData || { id: portfolioId, name: `Портфель ${portfolioId}` });

    const caseData = mockCase.find(c => c.portfolioId === portfolioId) || { userCurrencies: [], transactions: [] };

    // Создаем объект для соответствия символов валют и их изображений
    const currencyImages = {
      'USD': dollarImage,
      'EUR': euroImage,
      'CNY': yuanImage,
      'BTC': bitcoinImage
    };

    const defaultCurrencies = [
      {
        id: 2,
        symbol: 'USD',
        name: 'Доллар США',
        image: currencyImages['USD']
      },
      {
        id: 3,
        symbol: 'EUR',
        name: 'Евро',
        image: currencyImages['EUR']
      },
      {
        id: 1,
        symbol: 'CNY',
        name: 'Китайский юань',
        image: currencyImages['CNY']
      },
      {
        id: 4,
        symbol: 'BTC',
        name: 'Bitcoin',
        image: currencyImages['BTC']
      }
    ];

    const mergedCurrencies = defaultCurrencies.map(defaultCurrency => {
      const userCurrency = caseData.userCurrencies.find(uc => uc.symbol === defaultCurrency.symbol);
      return userCurrency ? { ...userCurrency, image: currencyImages[userCurrency.symbol] } : defaultCurrency;
    });

    setCurrencies(mergedCurrencies);
    setTransactions(caseData.transactions || []);
    setIsLoading(false);
  }, [portfolioId]);

  if (isLoading) {
    return <div>Загрузка данных портфеля...</div>;
  }

  if (!portfolio) {
    return <div>Данные портфеля не найдены</div>;
  }

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1>{portfolio.name}</h1>
        <div className="portfolio-stats">
          <p>Общая стоимость: ${portfolio.value?.toFixed(2) || '0.00'}</p>
          {portfolio.profit !== undefined && (
            <p className={portfolio.profit >= 0 ? 'profit' : 'loss'}>
              {portfolio.profit >= 0 ? 'Прибыль' : 'Убыток'}: ${Math.abs(portfolio.profit).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="crypto-dashboard">
        <div className="currency-cards-container">
          {currencies.map(currency => (
            <CurrencyCard 
              key={currency.id} 
              currency={currency} 
              onBuyClick={handleBuyClick}
            />
          ))}
        </div>

        <div className="transactions-container">
          <h2>История транзакций</h2>
          <div className="transactions-list">
            {transactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCurrencies;