import React, { useEffect, useState } from 'react';
import UserInfo from '../../components/UserInfo/UserInfo';
import PortfolioList from '../../components/PortfolioList/PortfolioList';
import './Profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Моковые данные (замените на реальный API-запрос)
    const fetchData = async () => {
      try {
        setUserData({
          username: 'crypto_user',
          email: 'user@example.com',
          balance: 10000,
          telegram_id: '@telegram_user'
        });

        setPortfolios([
          {
            id: 1,
            name: 'Основной портфель',
            value: 8500.50,
            profit: 250.75
          },
          {
            id: 2,
            name: 'Долгосрочные инвестиции',
            value: 4200.00,
            profit: -150.25
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="app-container">
      <UserInfo user={userData} />
      <PortfolioList portfolios={portfolios} />
    </div>
  );
}

export default Profile;