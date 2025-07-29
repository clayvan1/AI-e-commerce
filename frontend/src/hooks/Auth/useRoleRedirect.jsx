import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useLogin';

const useRoleRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === 'superadmin') {
      navigate('/dashboard/superadmin');
    } else if (user.role === 'shopkeeper') {
      navigate('/dashboard/shopkeeper');
    }
    // You can handle more roles here
  }, [user, navigate]);
};

export default useRoleRedirect;
