import React, { useState, useEffect } from 'react';
import './AlertPortfolio.css';
import { API_CONFIG } from '../../config/config';

const AlertPortfolio = ({ portfolioId, onClose }) => {
  const [showAlertModal, setShowAlertModal] = useState(true);
  const [alertData, setAlertData] = useState(null);
  const [alertForm, setAlertForm] = useState({ threshold: '', notification_channel: 'email', is_active: true });
  const [alertError, setAlertError] = useState(null);
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertData = async () => {
    try {
      setIsLoading(true);
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_CONFIG.BASE_URL}/portfolio/alerts?portfolio_id=${portfolioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-id': sessionId || '',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        if (data && Object.keys(data).length > 0) {
          setAlertData(data);
          setAlertForm({
            threshold: data.threshold.toString(),
            notification_channel: data.notification_channel,
            is_active: data.is_active,
          });
          setIsEditingAlert(false);
          console.log('Set alertData and alertForm:', data);
        } else {
          setAlertData(null);
          setAlertForm({ threshold: '', notification_channel: 'email', is_active: true });
          setIsEditingAlert(true);
          console.log('No alert data, set alertData to null');
        }
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных уведомлений:', err);
      setAlertError('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
      console.log('Fetch completed, isLoading set to false');
    }
  };

  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    setAlertError(null);

    if (!alertForm.threshold || parseFloat(alertForm.threshold) <= 0) {
      setAlertError('Введите корректное значение порога (положительное число)');
      return;
    }

    try {
      const sessionId = localStorage.getItem('session_id');
      const url = alertData
        ? `${API_CONFIG.BASE_URL}/portfolio/update_alert`
        : `${API_CONFIG.BASE_URL}/portfolio/create_alert`;
      const method = alertData ? 'PUT' : 'POST';
      const body = alertData
        ? {
            id: alertData.id,
            portfolio_id: parseInt(portfolioId),
            threshold: parseFloat(alertForm.threshold),
            notification_channel: alertForm.notification_channel,
            is_active: alertForm.is_active,
          }
        : {
            portfolio_id: parseInt(portfolioId),
            threshold: parseFloat(alertForm.threshold),
            notification_channel: alertForm.notification_channel,
            is_active: alertForm.is_active,
          };

      console.log('Submitting form with:', { method, body });

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
        throw new Error('Ошибка при сохранении уведомления');
      }

      await fetchAlertData();
      setIsEditingAlert(false);
    } catch (err) {
      setAlertError(err.message);
    }
  };

  const handleAlertFormChange = (field, value) => {
    console.log('Form change:', { field, value });
    setAlertForm((prev) => ({ ...prev, [field]: value }));
    setAlertError(null);
  };

  const handleEditAlert = () => {
    setAlertForm({
      threshold: alertData.threshold.toString(),
      notification_channel: alertData.notification_channel,
      is_active: alertData.is_active,
    });
    setIsEditingAlert(true);
    console.log('Editing alert, isEditingAlert set to true');
  };

  const handleCloseModal = () => {
    setShowAlertModal(false);
    setAlertForm({ threshold: '', notification_channel: 'email', is_active: true });
    setAlertError(null);
    setIsEditingAlert(false);
    onClose();
  };

  const handleCancel = () => {
    if (alertData) {
      setIsEditingAlert(false);
    } else {
      handleCloseModal();
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, [portfolioId]);

  console.log('Render state:', { isLoading, alertData, isEditingAlert, alertForm });

  return (
    showAlertModal && (
      <div className="alert-modal">
        <div className="alert-options-container">
          <button className="close-modal-btn" onClick={handleCloseModal}>
            ×
          </button>
          {isLoading ? (
            <div>Загрузка...</div>
          ) : alertData && !isEditingAlert ? (
            <div className="alert-settings-container">
              <h3>Настройки уведомлений</h3>
              <p>
                Статус: <span>{alertData.is_active ? 'Активно' : 'Неактивно'}</span>
              </p>
              <p>
                Канал: <span>{alertData.notification_channel === 'email' ? 'Email' : 'Telegram'}</span>
              </p>
              <p>
                Порог отслеживания: <span>{alertData.threshold.toFixed(2)}%</span>
              </p>
              <button onClick={handleEditAlert} className="edit-settings-btn">
                Настроить уведомления
              </button>
              {alertData.notification_channel === 'telegram' && (
                <a
                  href="https://t.me/currnecy_alert_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="telegram-link"
                >
                  Перейти в Telegram бота
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={handleAlertSubmit} className="alert-form">
              <label>
                Статус уведомлений
                <div className="switch-container">
                  <span className={alertForm.is_active ? '' : 'active'}>Неактивно</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={alertForm.is_active}
                      onChange={(e) => handleAlertFormChange('is_active', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className={alertForm.is_active ? 'active' : ''}>Активно</span>
                </div>
              </label>
              <label>
                Канал уведомлений
                <div className="switch-container">
                  <div className="notification-option">
                    <span className={`notification-label ${alertForm.notification_channel === 'email' ? 'active' : ''}`}>
                      Email
                    </span>
                    <button
                      type="button"
                      className={`notification-dot ${alertForm.notification_channel === 'email' ? 'active' : ''}`}
                      onClick={() => handleAlertFormChange('notification_channel', 'email')}
                    ></button>
                  </div>
                  <div className="notification-option">
                    <span className={`notification-label ${alertForm.notification_channel === 'telegram' ? 'active' : ''}`}>
                      Telegram
                    </span>
                    <button
                      type="button"
                      className={`notification-dot ${alertForm.notification_channel === 'telegram' ? 'active' : ''}`}
                      onClick={() => handleAlertFormChange('notification_channel', 'telegram')}
                    ></button>
                  </div>
                </div>
              </label>
              <label>
                Порог изменения (%)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={alertForm.threshold}
                  onChange={(e) => handleAlertFormChange('threshold', e.target.value)}
                  placeholder="Введите порог"
                  required
                />
              </label>
              {alertError && <div className="error-message">{alertError}</div>}
              <div className="form-buttons">
                <button type="button" className="back-btn" onClick={handleCancel}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn">
                  {alertData ? 'Обновить' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  );
};

export default AlertPortfolio;