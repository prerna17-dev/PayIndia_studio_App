const axios = require('axios');

/**
 * Service to handle SMS sending via Dreamz Technology API
 */
class SmsService {
    constructor() {
        this.baseUrl = process.env.DREAMZ_SMS_URL;
        this.username = process.env.DREAMZ_USERNAME;
        this.password = process.env.DREAMZ_PASSWORD;
        this.senderId = process.env.DREAMZ_SENDER_ID;
        this.templateId = process.env.DREAMZ_TEMPLATE_ID;
        this.peid = process.env.DREAMZ_PEID;
    }

    /**
     * Helper to check if a value is a placeholder or empty
     */
    isValid(value) {
        return value && value.trim() !== '' && !value.toLowerCase().includes('placeholder') && !value.includes('XXXX');
    }

    /**
     * Send SMS to a mobile number
     * @param {string} mobile - Recipient mobile number
     * @param {string} message - SMS content
     * @param {Object} [options] - Additional options (templateId, peid, msgType)
     * @returns {Promise<Object>} - API response
     */
    async sendSMS(mobile, message, options = {}) {
        try {
            // Mask password for logging
            const maskedPass = this.password ? `${this.password.substring(0, 2)}***${this.password.substring(this.password.length - 1)}` : 'MISSING';

            // Overloaded parameters - some gateways need different keys
            const params = {
                username: this.username,
                password: this.password,
                mobile: this.username,
                pass: this.password,
                senderid: this.senderId,
                to: mobile,
                msg: message
            };

            // DLT Specifics with multiple common variations
            const tId = options.templateId || this.templateId;
            if (this.isValid(tId)) {
                params.templateid = tId;
                params.DltTemplateId = tId;
                params.template_id = tId;
            }

            const pId = options.peid || this.peid;
            if (this.isValid(pId)) {
                params.peid = pId;
                params.PrincipalEntityId = pId;
                params.pe_id = pId;
            }

            // Handle Unicode
            if (options.msgType === 'uc' || /[\u0900-\u097F]/.test(message)) {
                params.msgtype = 'uc';
                params.type = '3';
            }

            console.log(`[SMS] Sending to ${mobile}...`);
            console.log(`[SMS] Params (masked):`, { ...params, pass: maskedPass, password: maskedPass });

            const response = await axios.get(this.baseUrl, { params });
            let resData = response.data;
            let resStr = typeof resData === 'string' ? resData : JSON.stringify(resData);

            console.log('[SMS] API Response:', resStr);

            // If it still fails with Auth error, try the 91 prefix for the mobile/username
            if (resStr.includes('Invalid Username or Password')) {
                console.warn('[SMS] Auth error. Trying with 91 prefix for credentials...');
                const altParams = { ...params, mobile: `91${this.username}`, username: `91${this.username}` };
                const altResponse = await axios.get(this.baseUrl, { params: altParams });
                console.log('[SMS] Retry Response:', altResponse.data);
                return altResponse.data;
            }

            return resData;
        } catch (error) {
            console.error('[SMS] Error:', error.message);
            throw error;
        }
    }
}

module.exports = new SmsService();
