import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService/authservice';
import { useStateContext } from '../../contexts/ContextProvider'; // ✅

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUserRole } = useStateContext(); // ✅

  const login = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(formData);

      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update global context
      setUserRole(data.user.role); // ✅

      // Redirect based on role
      switch (data.user.role) {
        case 'superadmin':
          navigate('/dashboard/superadmin');
          break;
        case 'shopkeeper':
          navigate('/dashboard/shopkeeper');
          break;
        case 'buyer':
          navigate('/Home');
          break;
        default:
          navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
