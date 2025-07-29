import axios from '../../utils/axiosInstance'; // Adjust path if needed

export const fetchUsers = () => {
  return axios.get('/users', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const updateUserRole = (userId, newRole) => {
  return axios.put(
    `/users/${userId}/role`,
    { role: newRole },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
};
