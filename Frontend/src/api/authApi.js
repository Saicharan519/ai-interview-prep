import axiosInstance from './axiosInstance';

export async function login(email, password) {
  const response = await axiosInstance.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function register(name, email, password) {
  const response = await axiosInstance.post('/api/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
}

export async function logout() {
  const response = await axiosInstance.post('/api/auth/logout');
  return response.data;
}
