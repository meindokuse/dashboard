import React, { useState } from "react";
import { API_CONFIG } from "../../config/config";
import { useAuth } from "../../context/AuthContext";

export const Register = ({ onFormSwitch }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [notificationHour, setNotificationHour] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const notificationTime = notificationHour 
        ? `${notificationHour.padStart(2, '0')}:00`
        : null;

      const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email,
          password: pass,
          telegram_id: telegram || null,
          notification_time: notificationTime,
          notification_channel: telegram ? "telegram" : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка регистрации');
      }

      alert('Регистрация успешна!');
      register();
      onFormSwitch('login');
      
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    }
  };

    return (
        <div className="auth-form-container">
            <h2>Регистрация</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Логин</label>
                <input value={name} onChange={(e) => setName(e.target.value)} 
                    id='name' required minLength="3" 
                    placeholder="username" autoComplete="username"/>
                
                <label htmlFor='email'>Почта</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} 
                    type='email' required placeholder='ivanov@gmail.com' 
                    id='email' name='email' autoComplete="email"/>
                
                <label htmlFor='password'>Пароль</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} 
                    type='password' required minLength="6" 
                    placeholder='********' id='password' name='password' 
                    autoComplete="new-password"/>
                
                <label htmlFor='telegram'>Telegram ID (необязательно)</label>
                <input value={telegram} onChange={(e) => setTelegram(e.target.value)} 
                    type='text' placeholder='@username' id='telegram'/>
                
                <label htmlFor='time'>Час уведомлений (необязательно)</label>
                <input 
                    value={notificationHour} 
                    onChange={(e) => setNotificationHour(e.target.value)} 
                    type='number' 
                    min="0" 
                    max="23" 
                    placeholder='12'
                    id='time'
                />
                
                <button type='submit' className="default">Зарегистрироваться</button>
            </form>
            <button className="link-btn" onClick={() => onFormSwitch('login')}>
                Уже имеете Аккаунт? Войдите
            </button>
        </div>
    )
}