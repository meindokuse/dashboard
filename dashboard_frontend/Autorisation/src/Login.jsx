import React, {useState} from "react";
export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [remember, setRemember] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://backend-url/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password: pass,
                    is_remember: remember
                })
            });
            
            if (!response.ok) throw new Error('Ошибка входа');
            
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Неверные данные');
        }
    }

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
                
                <button type='submit'>Вход</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch('register')}>
                Еще нет аккаунта? Зарегистрируйтесь
            </button>
        </div>
    )
}