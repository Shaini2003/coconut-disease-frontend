import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const predictDisease = (formData) => API.post('/predict', formData);
export const login = (credentials) => API.post('/login', credentials);