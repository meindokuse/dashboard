// Profile.js
import React, { useEffect, useState } from 'react';
import UserInfo from '../../components/UserInfo/UserInfo';
import PortfolioList from '../../components/PortfolioList/PortfolioList';
import { mockProfileData } from '../../data/mockProfile';
import './Profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация асинхронной загрузки данных
    const fetchData = async () => {
      try {
        // В реальном приложении здесь был бы API-запрос
        // Например: const response = await fetch('/api/profile');
        // const data = await response.json();
        
        // Используем моковые данные
        setTimeout(() => {
          setUserData(mockProfileData.userData);
          setPortfolios(mockProfileData.portfolios);
          setLoading(false);
        }, 500); // Имитация задержки сети
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