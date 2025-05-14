import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { API_CONFIG } from '../../config/config';

const CURRENCY_OPTIONS = [
  { value: 1, label: 'BTC' },
  { value: 2, label: 'SOL' },
  { value: 3, label: 'ETH' },
  { value: 4, label: 'TON' },
];

const Notifications = ({ user, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [notificationChannel, setNotificationChannel] = useState('email');
  const [hour, setHour] = useState('');
  const [currency, setCurrency] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAlert, setEditingAlert] = useState(null);
  const [showTelegramLink, setShowTelegramLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchAlert = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_CONFIG.BASE_URL}/alert/alerts`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке уведомления');
      }

      const data = await response.json();
      setAlert(data || null);
      onUpdate({ hasAlerts: !!data });
      if (data) {
        setNotificationChannel(data.notification_channel || 'email');
        setHour(data.notification_time ? data.notification_time.split(':')[0] : '');
        setCurrency(data.currency_id?.toString() || '');
        setIsActive(data.is_active !== undefined ? data.is_active : true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, []);

  const handleNotificationClick = () => {
    setShowModal(true);
    setError('');
    setEditingAlert(alert ? alert.id : null);
    setShowTelegramLink(false);
    setSuccessMessage('');
  };

  const handleEditAlert = (alert) => {
    setShowModal(true);
    setNotificationChannel(alert.notification_channel || 'email');
    setHour(alert.notification_time ? alert.notification_time.split(':')[0] : '');
    setCurrency(alert.currency_id?.toString() || '');
    setIsActive(alert.is_active !== undefined ? alert.is_active : true);
    setEditingAlert(alert.id);
    setShowTelegramLink(false);
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setHour('');
    setCurrency('');
    setError('');
    setEditingAlert(null);
    setShowTelegramLink(false);
    setSuccessMessage('');
  };

  const handleToggleAlert = async (alertId, currentActiveStatus) => {
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_CONFIG.BASE_URL}/alert/update_alert`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: alertId,
          is_active: !currentActiveStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при изменении статуса уведомления');
      }

      await fetchAlert(); // Повторно загружаем данные после изменения статуса
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hour || !currency) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const sessionId = localStorage.getItem('session_id');
      const requestBody = {
        currency_id: parseInt(currency),
        notification_time: `${hour}:00:00`,
        notification_channel: notificationChannel,
        is_active: isActive,
      };

      if (editingAlert) {
        requestBody.id = editingAlert;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alert/${editingAlert ? 'update_alert' : 'create_alert'}`,
        {
          method: editingAlert ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-session-id': sessionId || '',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка при сохранении уведомления');
      }

      await fetchAlert(); // Повторно загружаем данные после сохранения

      if (notificationChannel === 'telegram') {
        setSuccessMessage('Настройки сохранены! Теперь перейдите в бота для завершения настройки.');
        setShowTelegramLink(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getCurrencyName = (currencyId) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.value === currencyId);
    return currency ? currency.label : `Валюта #${currencyId}`;
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="notification-container">
      {alert ? (
        <div className="current-settings">
          <h3 className="current-settings-title">Текущие настройки уведомлений</h3>
          <div className="alert-item">
            <div className="alert-details">
              <p>
                <strong>Статус:</strong>
                <span className={isActive ? 'active-status' : 'inactive-status'}>
                  {isActive ? 'Активна' : 'Неактивна'}
                </span>
              </p>
              <p>
                <strong>Канал:</strong>
                <span>{alert.notification_channel === 'email' ? 'Email' : 'Telegram'}</span>
              </p>
              <p>
                <strong>Валюта:</strong>
                <span>{getCurrencyName(alert.currency_id)}</span>
              </p>
              <p>
                <strong>Время уведомления:</strong>
                <span>
                  {alert.notification_time && typeof alert.notification_time === 'string'
                    ? `${alert.notification_time.split(':')[0]}:00`
                    : 'Не указано'}
                </span>
              </p>
            </div>
            <div className="alert-actions">
              <button onClick={() => handleEditAlert(alert)} className="edit-btn">
                Изменить
              </button>
              <button
                onClick={() => handleToggleAlert(alert.id, isActive)}
                className="toggle-btn"
              >
                {isActive ? 'Деактивировать' : 'Активировать'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={handleNotificationClick} className="notification-btn">
          Настроить уведомления
        </button>
      )}

      {showModal && (
        <div className="notification-modal">
          <div className="notification-options-container">
            <button className="close-modal-btn" onClick={handleCloseModal}>
              ×
            </button>
            <form onSubmit={handleSubmit} className="notification-form">
              <label>
                Канал уведомлений
                <div className="switch-container">
                  <span className={notificationChannel === 'email' ? 'active' : ''}>Email</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationChannel === 'telegram'}
                      onChange={(e) => setNotificationChannel(e.target.checked ? 'telegram' : 'email')}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className={notificationChannel === 'telegram' ? 'active' : ''}>Telegram</span>
                </div>
              </label>
              <label>
                Валюта для отслеживания
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                >
                  <option value="">Выберите валюту</option>
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Время уведомления (часы)
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = '';
                    if (value < 0) value = 0;
                    if (value > 23) value = 23;
                    setHour(value);
                  }}
                  required
                  placeholder="Час (0-23)"
                />
              </label>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              {showTelegramLink ? (
                <a
                  href="https://t.me/currnecy_alert_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="telegram-link"
                >
                  Перейти в Telegram бота
                </a>
              ) : (
                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {editingAlert ? 'Обновить' : 'Сохранить'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;