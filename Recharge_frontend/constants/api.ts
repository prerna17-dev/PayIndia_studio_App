import { Platform } from 'react-native';


// Replace this IP address with your computer's current IP address (IPv4)
// Run 'ipconfig' in terminal to find your IPv4 address
export const API_BASE_URL = "http://192.168.1.9:5000";


// For Web, connect to the exact same host/port as the window.
// For Native, fall back to the exact IP of the metro bundler or hardcoded backend.
export const API_BASE_URL = Platform.OS === 'web' && typeof window !== 'undefined'
  ? `http://${window.location.hostname}:5000` 
  : "http://192.168.1.7:5000"; // Fallback for native devices


export const API_ENDPOINTS = {
    // Auth
    SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,

    // Banking
    BANK_LIST: `${API_BASE_URL}/api/banking/bank-list`,
    BANK_ACCOUNTS: `${API_BASE_URL}/api/banking/accounts`,
    ADD_ACCOUNT: `${API_BASE_URL}/api/banking/add-account`,
    REMOVE_ACCOUNT: `${API_BASE_URL}/api/banking/remove-account`,
    VERIFY_ACCOUNT: `${API_BASE_URL}/api/banking/verify-account`,
    BANK_VERIFY_OTP: `${API_BASE_URL}/api/banking/verify-otp`,

    // Profile
    USER_PROFILE: `${API_BASE_URL}/api/user/profile`,

    // Payment / Wallet
    CREATE_PAYMENT_ORDER: `${API_BASE_URL}/api/payment/create-order`,
    VERIFY_PAYMENT: `${API_BASE_URL}/api/payment/verify-payment`,

    // Recharge
    RECHARGE_OPERATORS: `${API_BASE_URL}/api/recharge/operators`,
    MOBILE_RECHARGE: `${API_BASE_URL}/api/recharge/mobile`,
    RECHARGE_STATUS: `${API_BASE_URL}/api/recharge/status`,

    // Bill Payment
    BILL_OPERATORS: `${API_BASE_URL}/api/bill/operators`,
    FETCH_BILL: `${API_BASE_URL}/api/bill/fetch`,
    PAY_BILL: `${API_BASE_URL}/api/bill/pay`,
    BILL_STATUS: `${API_BASE_URL}/api/bill/status`,
};
