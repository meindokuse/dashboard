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

  // Загрузка данных пользователя с сервера
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Для куков
          body: JSON.stringify({
            // Добавляем user_id, если сервер его требует
            // user_id: userId 
            // (раскомментируйте, если серверу нужно явно передавать ID)
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        
        const userData = {
          id: data.id,
          username: data.username,
          email: data.email,
          created_at: new Date(data.created_at),
          balance: parseFloat(data.balance),
          telegram_id: data.telegram_id || null,
          notification_time: data.notification_time 
            ? new Date(`1970-01-01T${data.notification_time}Z`) 
            : null,
          notification_channel: data.notification_channel || null
        };
        
        setUser(userData);
      } catch (err) {
        setFetchError(err.message);
        console.error('Ошибка при загрузке профиля:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  const handleNotifications = () => {
    setShowOptions(!showOptions);
    setSelectedOption(null);
    setInputValue('');
    setFormError('');
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setFormError('');
    // Устанавливаем текущее значение пользователя в поле ввода
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
    if (validateInput()) {
      try {
        // Отправка обновленных данных на сервер
        const response = await fetch(`${API_CONFIG}/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            [selectedOption === 'email' ? 'email' : 'telegram_id']: inputValue
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении данных');
        }

        // Обновляем локальные данные пользователя
        const updatedUser = { ...user };
        if (selectedOption === 'email') {
          updatedUser.email = inputValue;
        } else {
          updatedUser.telegram_id = inputValue;
        }
        setUser(updatedUser);

        setShowOptions(false);
        setSelectedOption(null);
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  if (loading) {
    return <div>Загрузка данных пользователя...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!user) {
    return <div>Данные пользователя не найдены</div>;
  }

  return (
    <div className="user-info">
      <h2>Информация о пользователе</h2>
      <div className="user-details">
        <p><strong>Имя:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Баланс:</strong> ${user.balance?.toFixed(2) || '0.00'}</p>
        <p><strong>Telegram:</strong> {user.telegram_id || 'Не указан'}</p>
        <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        {user.notification_time && (
          <p><strong>Время уведомлений:</strong> {user.notification_time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        )}
        {user.notification_channel && (
          <p><strong>Канал уведомлений:</strong> {user.notification_channel}</p>
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