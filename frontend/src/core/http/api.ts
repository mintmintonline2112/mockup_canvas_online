import axios from 'axios';

// Để trống VITE_API_BASE -> dùng Vite proxy (/api -> backend :3001).
const baseURL = import.meta.env.VITE_API_BASE || '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Backend bọc response trong { statusCode, message, data } (TransformInterceptor).
// Unwrap để service chỉ nhận `data`.
api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  (err) => Promise.reject(err),
);
