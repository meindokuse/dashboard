import React, { useState, useEffect } from 'react';
import './UserInfo.css';
import { API_CONFIG } from "../../config/config";

function UserInfo({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setFetchError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [formError, setFormError] = useState('');

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
        
        // Парсим данные из поля "user" в ответе
        const userData = data.user ? {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          created_at: new Date(data.user.created_at),
          balance: parseFloat(data.user.balance),
          telegram_id: data.user.telegram_id || null,
          notification_time: data.user.notification_time 
            ? new Date(`1970-01-01T${data.user.notification_time}Z`) 
            : null,
          notification_channel: data.user.notification_channel || null
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

  const handleNotifications = () => {
    setShowOptions(!showOptions);
    setSelectedOption(null);
    setInputValue('');
    setFormError('');
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setFormError('');
    if (option === 'email') {
      setInputValue(user.email);
    } else if (option === 'telegram') {
      setInputValue(user.telegram_id || '');
    }
  };

  const validateInput = () => {
    if (selectedOption === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        setFormError('Пожалуйста, введите корректный email');
        return false;
      }
    } else if (selectedOption === 'telegram') {
      if (!inputValue.trim()) {
        setFormError('Пожалуйста, введите Telegram ID');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [selectedOption === 'email' ? 'email' : 'telegram_id']: inputValue
        })
      });

      if (response.status === 401) {
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка при обновлении данных');
      }

      const updatedData = await response.json();
      
      // Обновляем пользователя с учетом новой структуры ответа
      if (updatedData.user) {
        setUser(prev => ({
          ...prev,
          email: updatedData.user.email || prev.email,
          telegram_id: updatedData.user.telegram_id || prev.telegram_id
        }));
      }

      setShowOptions(false);
      setSelectedOption(null);
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Произошла ошибка при обновлении');
      console.error('Ошибка обновления:', err);
    }
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
          <strong>Telegram ID:</strong>
          <span>{user.telegram_id || 'Не указан'}</span>
        </p>
        <p>
          <strong>Дата регистрации:</strong>
          <span>{user.created_at.toLocaleDateString()}</span>
        </p>
        {user.notification_time && (
          <p>
            <strong>Время уведомлений:</strong>
            <span>{user.notification_time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </p>
        )}
        {user.notification_channel && (
          <p>
            <strong>Канал уведомлений:</strong>
            <span>{user.notification_channel}</span>
          </p>
        )}
      </div>
      
      <div className="notification-container">
        <button 
          onClick={handleNotifications}
          className="notification-btn"
        >
          Настроить уведомления
        </button>
        
        {showOptions && (
          <div className="notification-options-container">
            {!selectedOption ? (
              <div className="notification-options">
                <button 
                  onClick={() => handleOptionSelect('email')}
                  className="option-btn"
                >
                  Email уведомления
                </button>
                <button 
                  onClick={() => handleOptionSelect('telegram')}
                  className="option-btn"
                >
                  Telegram уведомления
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="notification-form">
                <label>
                  {selectedOption === 'email' ? 'Email адрес' : 'Telegram ID'}
                  <input
                    type={selectedOption === 'email' ? 'email' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                    className={formError ? 'input-error' : ''}
                  />
                </label>
                {formError && <div className="error-message">{formError}</div>}
                <div className="form-buttons">
                  <button 
                    type="button" 
                    onClick={() => setSelectedOption(null)}
                    className="back-btn"
                  >
                    Назад
                  </button>
                  <button type="submit" className="submit-btn">
                    Сохранить
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div> 
    </div>
  );
}

export default UserInfo;