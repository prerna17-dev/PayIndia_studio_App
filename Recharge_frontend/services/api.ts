import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use your computer's IP address instead of localhost for physical device testing
// Replace '192.168.1.XX' with your actual local IP
const BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.22:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
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
