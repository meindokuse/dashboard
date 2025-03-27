import React, { useState } from "react";

export const Register = (props) => {
    const [email,setEmail] = useState('');
    const[pass, setPass] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
        console.log(pass);
        console.log(name);
    }
    return (
        <div className="auth-form-container">
            <h2>Регистрация</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Логин</label>
                <input value={name} name = 'name' onChange={(e) => setName(e.target.value)} id='name' placeholder="username" autoComplete="username"></input>
                <label htmlFor='email'>Почта</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='ivanov@gmail.com' id='email' name='email' autoComplete="email"/>
                <label htmlFor='password'>Пароль</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type='password' placeholder='********' id='password' name='password' autoComplete="current-password"/>
                <button type='submit'>Вход</button>
            </form>
            <button className="link-btn" onClick={() => props.onFormSwitch('login')}>Уже имеете Аккаунт? Войдите</button>
        </div>
    )
}    
