import React, { useState } from "react";
import { API_CONFIG } from "../../config/config";
import { useAuth } from "../../context/AuthContext";

export const Register = ({ onFormSwitch }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: name,
            email,
            password: pass,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка регистрации');
      }

      const userData = await response.json();
      register(userData); // Передаем данные пользователя в контекст
      onFormSwitch('login');
      alert('Регистрация успешна!');

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
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          required
          minLength="3"
          placeholder="username"
          autoComplete="username"
        />

        <label htmlFor="email">Почта</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="ivanov@gmail.com"
          id="email"
          autoComplete="email"
        />

        <label htmlFor="password">Пароль</label>
        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          type="password"
          required
          minLength="6"
          placeholder="********"
          id="password"
          autoComplete="new-password"
        />

        <button type="submit" className="default">
          Зарегистрироваться
        </button>
      </form>

      <button
        className="link-btn"
        onClick={() => onFormSwitch('login')}
      >
        Уже есть аккаунт? Войти
      </button>
    </div>
  );
};