/**
 * API Configuration
 * Centralized file for all backend connections.
 */

// Replace this IP address with your computer's current IP address (IPv4)
// Run 'ipconfig' in terminal to find your IPv4 address
export const API_BASE_URL = "http://192.168.1.19:5000";

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
