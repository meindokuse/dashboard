import React, { useState, useEffect } from 'react';
import './UserInfo.css';
import Notifications from '../Notifications/Notifications';
import { API_CONFIG } from "../../config/config";

function UserInfo({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setFetchError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem("session_id");
        const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-session-id': sessionId || '',
          },
          credentials: 'include',
          body: JSON.stringify({})
        });

        if (response.status === 401) {
          throw new Error('Не авторизован. Пожалуйста, войдите снова.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Ошибка HTTP! Статус: ${response.status}`);
        }

        const data = await response.json();
        
        const userData = data.user ? {
          username: data.user.username,
          email: data.user.email,
          created_at: new Date(data.user.created_at),
          balance: parseFloat(data.user.balance),
          unique_id: data.user.unique_id
        } : null;
        
        setUser(userData);
      } catch (err) {
        setFetchError(err.message);
        console.error('Ошибка при загрузке профиля:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleUserUpdate = (updatedFields) => {
    setUser(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  if (loading) {
    return <div className="loading-message">Загрузка данных пользователя...</div>;
  }

  if (error) {
    return <div className="error-message">Ошибка: {error}</div>;
  }

  if (!user) {
    return <div className="no-data-message">Данные пользователя не найдены</div>;
  }

  return (
    <div className="user-info">
      <h2>Информация о пользователе</h2>
      <div className="user-details">
        <p>
          <strong>Имя пользователя:</strong>
          <span>{user.username}</span>
        </p>
        <p>
          <strong>Email:</strong>
          <span>{user.email}</span>
        </p>
        <p>
          <strong>Баланс:</strong>
          <span>${user.balance?.toFixed(2) || '0.00'}</span>
        </p>
        <p>
          <strong>Уникальный ID:</strong>
          <span>{user.unique_id || 'Не указан'}</span>
        </p>
        <p>
          <strong>Дата регистрации:</strong>
          <span>{user.created_at.toLocaleDateString()}</span>
        </p>
      </div>
      
      <Notifications user={user} onUpdate={handleUserUpdate} />
    </div>
  );
}

export default UserInfo;