import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const login = async (data) => {
  const res = await axios.post(`${API_BASE}/auth/login`, data);
  return res.data; 
};

const register = async (data) => {
  const res = await axios.post(`${API_BASE}/auth/register`, data);
  return res.data;
};

export default { login, register };
