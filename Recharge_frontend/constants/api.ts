/**
 * API Configuration
 * Centralized file for all backend connections.
 */

// Replace this IP address with your computer's current IP address (IPv4)
// Run 'ipconfig' in terminal to find your IPv4 address
export const API_BASE_URL = "http://192.168.1.7:5000";


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
    USER_TRANSACTIONS: `${API_BASE_URL}/api/user/transactions`,

    // Wallet
    WALLET_BALANCE: `${API_BASE_URL}/api/wallet/balance`,
    WALLET_ADD: `${API_BASE_URL}/api/wallet/add`,
    WALLET_WITHDRAW: `${API_BASE_URL}/api/wallet/withdraw`,
    WALLET_TRANSACTIONS: `${API_BASE_URL}/api/wallet/transactions`,

    // Recharge
    RECHARGE_OPERATORS: `${API_BASE_URL}/api/recharge/operators`,
    MOBILE_RECHARGE: `${API_BASE_URL}/api/recharge/mobile`,
    RECHARGE_STATUS: `${API_BASE_URL}/api/recharge/status`,

    // Bill Payment
    BILL_OPERATORS: `${API_BASE_URL}/api/bill/operators`,
    FETCH_BILL: `${API_BASE_URL}/api/bill/fetch`,
    PAY_BILL: `${API_BASE_URL}/api/bill/pay`,
    BILL_STATUS: `${API_BASE_URL}/api/bill/status`,

    // Aadhaar
    AADHAAR_ENROLL: `${API_BASE_URL}/api/aadhar/enroll`,
    AADHAAR_CORRECTION_OTP_SEND: `${API_BASE_URL}/api/aadhar/correction/send-otp`,
    AADHAAR_CORRECTION_OTP_VERIFY: `${API_BASE_URL}/api/aadhar/correction/verify-otp`,
    AADHAAR_CORRECTION_SUBMIT: `${API_BASE_URL}/api/aadhar/correction/submit`,
    
    // PAN Card Services
    PAN_APPLY: `${API_BASE_URL}/api/pan/apply`,
    PAN_CORRECTION_OTP_SEND: `${API_BASE_URL}/api/pan/correction/send-otp`,
    PAN_CORRECTION_OTP_VERIFY: `${API_BASE_URL}/api/pan/correction/verify-otp`,
    PAN_CORRECTION_SUBMIT: `${API_BASE_URL}/api/pan/correction/submit`,

    // Udyam Registration Services
    UDYAM_APPLY: `${API_BASE_URL}/api/business/udyam/apply`,
    UDYAM_LIST: `${API_BASE_URL}/api/business/udyam/list`,
    UDYAM_CORRECTIONS: `${API_BASE_URL}/api/business/udyam/corrections`,
    UDYAM_CORRECTION_SUBMIT: `${API_BASE_URL}/api/business/udyam/correction/submit`,
    UDYAM_SEND_OTP: `${API_BASE_URL}/api/business/udyam/send-otp`,
    UDYAM_VERIFY_OTP: `${API_BASE_URL}/api/business/udyam/verify-otp`,
};
