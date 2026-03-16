require('dotenv').config();
const smsService = require('./src/services/sms.service');

async function debugSMS() {
    const mobile = '9923400506';
    const message = 'Your password has been successfully reset. Please log in with your new password: 123456 - WRKNAI, Namastey';

    console.log('--- SMS Service Detailed Debug ---');
    try {
        const result = await smsService.sendSMS(mobile, message);
        console.log('Debug Result:', result);
    } catch (error) {
        console.error('Debug Final Error:', error.message);
    }
}

debugSMS();
