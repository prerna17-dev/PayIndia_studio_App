/**
 * API Configuration
 * Centralized file for all backend connections.
 */

// Replace this IP address with your computer's current IP address (IPv4)
// Run 'ipconfig' in terminal to find your IPv4 address

<<<<<<< HEAD
export const API_BASE_URL = "http://192.168.1.15:5000";
=======
export const API_BASE_URL = "http://192.168.1.24:5000";
>>>>>>> d1142ff3cf3f85edf1e6e75ca7978b53680a6c3d


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
    PAN_APPLY_OTP_SEND: `${API_BASE_URL}/api/pan/apply/send-otp`,
    PAN_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/pan/apply/verify-otp`,
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

    // Certificates
    INCOME_APPLY: `${API_BASE_URL}/api/certificate/income/apply`,
    INCOME_OTP_SEND: `${API_BASE_URL}/api/certificate/income/send-otp`,
    INCOME_OTP_VERIFY: `${API_BASE_URL}/api/certificate/income/verify-otp`,
    CASTE_APPLY: `${API_BASE_URL}/api/certificate/caste/apply`,
    CASTE_OTP_SEND: `${API_BASE_URL}/api/certificate/caste/apply/send-otp`,
    CASTE_OTP_VERIFY: `${API_BASE_URL}/api/certificate/caste/apply/verify-otp`,
    DOMICILE_APPLY: `${API_BASE_URL}/api/certificate/domicile/apply`,
    DOMICILE_OTP_SEND: `${API_BASE_URL}/api/certificate/domicile/send-otp`,
    DOMICILE_OTP_VERIFY: `${API_BASE_URL}/api/certificate/domicile/verify-otp`,
    BIRTH_APPLY: `${API_BASE_URL}/api/certificate/birth/apply`,
    BIRTH_OTP_SEND: `${API_BASE_URL}/api/certificate/birth/send-otp`,
    BIRTH_OTP_VERIFY: `${API_BASE_URL}/api/certificate/birth/verify-otp`,
    DEATH_APPLY: `${API_BASE_URL}/api/certificate/death/apply`,
    DEATH_OTP_SEND: `${API_BASE_URL}/api/certificate/death/send-otp`,
    DEATH_OTP_VERIFY: `${API_BASE_URL}/api/certificate/death/verify-otp`,
    MARRIAGE_APPLY: `${API_BASE_URL}/api/certificate/marriage/apply`,
    MARRIAGE_OTP_SEND: `${API_BASE_URL}/api/certificate/marriage/send-otp`,
    MARRIAGE_OTP_VERIFY: `${API_BASE_URL}/api/certificate/marriage/verify-otp`,
    EWS_APPLY: `${API_BASE_URL}/api/certificate/ews/apply`,
    EWS_OTP_SEND: `${API_BASE_URL}/api/certificate/ews/send-otp`,
    EWS_OTP_VERIFY: `${API_BASE_URL}/api/certificate/ews/verify-otp`,
    NCL_APPLY: `${API_BASE_URL}/api/certificate/ncl/apply`,
    NCL_OTP_SEND: `${API_BASE_URL}/api/certificate/ncl/send-otp`,
    NCL_OTP_VERIFY: `${API_BASE_URL}/api/certificate/ncl/verify-otp`,

    // Voter ID Services
    VOTER_APPLY: `${API_BASE_URL}/api/voter/apply`,
    VOTER_APPLY_OTP_SEND: `${API_BASE_URL}/api/voter/apply/send-otp`,
    VOTER_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/voter/apply/verify-otp`,
    VOTER_CORRECTION_OTP_SEND: `${API_BASE_URL}/api/voter/correction/send-otp`,
    VOTER_CORRECTION_OTP_VERIFY: `${API_BASE_URL}/api/voter/correction/verify-otp`,
    VOTER_CORRECTION_SUBMIT: `${API_BASE_URL}/api/voter/correction/submit`,

    // Ration Card Services
    RATION_CARD_APPLY: `${API_BASE_URL}/api/social/ration-card/apply`,
    RATION_CARD_APPLY_OTP_SEND: `${API_BASE_URL}/api/social/ration-card/apply/send-otp`,
    RATION_CARD_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/social/ration-card/apply/verify-otp`,
    RATION_CARD_CORRECTION: `${API_BASE_URL}/api/social/ration-card/correction`,
    RATION_CARD_CORRECTION_OTP_SEND: `${API_BASE_URL}/api/social/ration-card/correction/send-otp`,
    RATION_CARD_CORRECTION_OTP_VERIFY: `${API_BASE_URL}/api/social/ration-card/correction/verify-otp`,

    // Land Records
    LAND_712_APPLY: `${API_BASE_URL}/api/land/712/apply`,
    LAND_712_OTP_SEND: `${API_BASE_URL}/api/land/712/send-otp`,
    LAND_712_OTP_VERIFY: `${API_BASE_URL}/api/land/712/verify-otp`,
    LAND_712_CORRECTION_SUBMIT: `${API_BASE_URL}/api/land/712/correction/submit`,
    FERFAR_APPLY: `${API_BASE_URL}/api/land/ferfar/apply`,
    FERFAR_OTP_SEND: `${API_BASE_URL}/api/land/ferfar/send-otp`,
    FERFAR_OTP_VERIFY: `${API_BASE_URL}/api/land/ferfar/verify-otp`,
    FERFAR_CORRECTION_SUBMIT: `${API_BASE_URL}/api/land/ferfar/correction/submit`,
    LAND_8A_APPLY: `${API_BASE_URL}/api/land/8a/apply`,
    LAND_8A_LIST: `${API_BASE_URL}/api/land/8a/list`,
    LAND_8A_OTP_SEND: `${API_BASE_URL}/api/land/8a/send-otp`,
    LAND_8A_OTP_VERIFY: `${API_BASE_URL}/api/land/8a/verify-otp`,
    LAND_8A_CORRECTION_SUBMIT: `${API_BASE_URL}/api/land/8a/correction/submit`,

    // Property Tax Services
    PROPERTY_TAX_OTP_SEND: `${API_BASE_URL}/api/land/property-tax/otp/send`,
    PROPERTY_TAX_OTP_VERIFY: `${API_BASE_URL}/api/land/property-tax/otp/verify`,
    PROPERTY_TAX_APPLY_NEW: `${API_BASE_URL}/api/land/property-tax/apply-new`,
    PROPERTY_TAX_CORRECTION_SUBMIT: `${API_BASE_URL}/api/land/property-tax/submit-correction`,

    // PM Kisan Services
    PM_KISAN_APPLY: `${API_BASE_URL}/api/social/pm-kisan/apply`,
    PM_KISAN_OTP_SEND: `${API_BASE_URL}/api/social/pm-kisan/otp/send`,
    PM_KISAN_OTP_VERIFY: `${API_BASE_URL}/api/social/pm-kisan/otp/verify`,
    PM_KISAN_CORRECTION_SUBMIT: `${API_BASE_URL}/api/social/pm-kisan/correction`,
    PM_KISAN_STATUS: `${API_BASE_URL}/api/social/pm-kisan/status`,

    // Senior Citizen Certificate
    SENIOR_CITIZEN_APPLY: `${API_BASE_URL}/api/social/senior-citizen/apply`,
    SENIOR_CITIZEN_LIST: `${API_BASE_URL}/api/social/senior-citizen/list`,
    SENIOR_CITIZEN_APPLY_OTP_SEND: `${API_BASE_URL}/api/social/senior-citizen/apply/otp/send`,
    SENIOR_CITIZEN_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/social/senior-citizen/apply/otp/verify`,
    SENIOR_CITIZEN_OTP_SEND: `${API_BASE_URL}/api/social/senior-citizen/otp/send`,
    SENIOR_CITIZEN_OTP_VERIFY: `${API_BASE_URL}/api/social/senior-citizen/otp/verify`,
    SENIOR_CITIZEN_CORRECTION_SUBMIT: `${API_BASE_URL}/api/social/senior-citizen/correction`,

    // Employment Registration
    EMPLOYMENT_APPLY: `${API_BASE_URL}/api/social/employment/apply`,
    EMPLOYMENT_APPLY_OTP_SEND: `${API_BASE_URL}/api/social/employment/apply/otp/send`,
    EMPLOYMENT_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/social/employment/apply/otp/verify`,
    EMPLOYMENT_OTP_SEND: `${API_BASE_URL}/api/social/employment/otp/send`,
    EMPLOYMENT_OTP_VERIFY: `${API_BASE_URL}/api/social/employment/otp/verify`,
    EMPLOYMENT_CORRECTION_OTP_SEND: `${API_BASE_URL}/api/social/employment/correction/otp/send`,
    EMPLOYMENT_CORRECTION_OTP_VERIFY: `${API_BASE_URL}/api/social/employment/correction/otp/verify`,
    EMPLOYMENT_CORRECTION_SUBMIT: `${API_BASE_URL}/api/social/employment/correction`,

    // Ayushman Bharat
    AYUSHMAN_APPLY: `${API_BASE_URL}/api/social/ayushman/apply`,
    AYUSHMAN_LIST: `${API_BASE_URL}/api/social/ayushman/list`,
    AYUSHMAN_APPLY_OTP_SEND: `${API_BASE_URL}/api/social/ayushman/apply/otp/send`,
    AYUSHMAN_APPLY_OTP_VERIFY: `${API_BASE_URL}/api/social/ayushman/apply/otp/verify`,
    AYUSHMAN_OTP_SEND: `${API_BASE_URL}/api/social/ayushman/otp/send`,
    AYUSHMAN_OTP_VERIFY: `${API_BASE_URL}/api/social/ayushman/otp/verify`,
    AYUSHMAN_CORRECTION_SUBMIT: `${API_BASE_URL}/api/social/ayushman/correction`,
    REFERRAL_INFO: `${API_BASE_URL}/api/referral/info`,
};
