import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { Login } from './Login';
import { Register } from './Register';
import { useAuth } from "../../context/AuthContext";

function Auth() {
  const { isLoggedIn } = useAuth();
  const [currentForm, setCurrentForm] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <div className="Auth">
      {currentForm === 'login' 
        ? <Login onFormSwitch={toggleForm} /> 
        : <Register onFormSwitch={toggleForm} />
      }
    </div>
  );
}

export default Auth;