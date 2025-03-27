import React, {useState} from "react";
export const Login = (props) => {
    const [email,setEmail] = useState('');
    const[pass, setPass] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
        console.log(pass);
    }
    return (
        <div className="auth-form-container">
            <h2>Вход</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor='email'>Почта</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='ivanov@gmail.com' id='email' name='email' autoComplete="email"/>
                <label htmlFor='password'>Пароль</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type='password' placeholder='********' id='password' name='password' autoComplete="current-password"/>
                <button type='submit'>Вход</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch('register')}>Еще нет аккаунта? Зарегистрируйтесь</button>
        </div>
    )
}