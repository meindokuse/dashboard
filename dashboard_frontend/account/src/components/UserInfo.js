import React from 'react';
import '../styles/UserInfo.css';

function UserInfo({ user }) {
  const handleNotifications = () => {
    alert('Настройка уведомлений');
  };

  return (
    <div className="user-info">
      <h2>Информация о пользователе</h2>
      <div className="user-details">
        <p><strong>Имя:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Баланс:</strong> ${user.balance.toFixed(2)}</p>
        <p><strong>Telegram:</strong> {user.telegram_id || 'Не указан'}</p>
      </div>
      <button 
        onClick={handleNotifications}
        className="notification-btn"
      >
        Настроить уведомления
      </button>
    </div>
  );
}

export default UserInfo;