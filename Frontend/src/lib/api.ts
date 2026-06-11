const API_URL = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token');
export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Upload image for detection
export const detectDisease = async (imageFile: File) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${API_URL}/detect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getHistory = () => apiRequest('/detect/history');
export const getDiseases = () => apiRequest('/detect/diseases');