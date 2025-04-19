import React, { useState } from 'react';
import '../styles/UserInfo.css';

function UserInfo({ user }) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleNotifications = () => {
    setShowOptions(!showOptions);
    setSelectedOption(null);
    setInputValue('');
    setError('');
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setError('');
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
        setError('Пожалуйста, введите корректный email');
        return false;
      }
    } else if (selectedOption === 'telegram') {
      if (!inputValue.trim()) {
        setError('Пожалуйста, введите Telegram ID');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInput()) {
      // Здесь будет логика отправки данных на сервер
      alert(`Данные для ${selectedOption} отправлены: ${inputValue}`);
      setShowOptions(false);
      setSelectedOption(null);
    }
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
                    className={error ? 'input-error' : ''}
                  />
                </label>
                {error && <div className="error-message">{error}</div>}
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