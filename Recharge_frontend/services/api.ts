import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

// Uses the shared, environment-aware API_BASE_URL from constants/api.ts
// This dynamically resolves to the correct host on both web and native.
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
