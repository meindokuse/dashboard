import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_CONFIG } from "../../config/config";


export const Login = ({ onFormSwitch }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: pass,
        is_remember: remember
      }),
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка входа');
    }

    const data = await response.json();
    
    // Сохраняем и токен и session_id (если есть)
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    if (data.session_id) {
      localStorage.setItem('session_id', data.session_id);
    }
    
    // Вызываем login с полученными данными
    login(data.access_token);
    
  } catch (error) {
    console.error('Ошибка:', error);
    alert(error.message);
  }
};


    return (
        <div className="auth-form-container">
            <h2>Вход</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor='email'>Почта</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} 
                    type='email' required placeholder='ivanov@gmail.com' 
                    id='email' name='email' autoComplete="email"/>
                
                <label htmlFor='password'>Пароль</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} 
                    type='password' required minLength="6" 
                    placeholder='********' id='password' name='password' 
                    autoComplete="current-password"/>
                
                <label className="remember-me">
                    <input type="checkbox" 
                        checked={remember} 
                        onChange={(e) => setRemember(e.target.checked)}/>
                    Запомнить меня
                </label>
                
                <button className='default' type='submit'>Вход</button>
            </form>
            <button className="link-btn" onClick={() => onFormSwitch('register')}>
                Еще нет аккаунта? Зарегистрируйтесь
            </button>
        </div>
    )
}