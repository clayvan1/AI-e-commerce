// src/hooks/useSignup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/authService/authservice';

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const signup = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await signupUser(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

export default useSignup;