require('dotenv').config();
const smsService = require('./src/services/sms.service');

async function testSMS() {
    const mobile = '9876543210'; // Replace with a real number for a live test if needed
    const message = 'Test message from PayIndia Studio';

    console.log('--- SMS Service Test ---');
    console.log('Mobile:', mobile);
    console.log('Message:', message);

    try {
        // Note: This will likely fail with 401/Invalid credentials if placeholders are used
        const result = await smsService.sendSMS(mobile, message);
        console.log('Test Result:', result);
    } catch (error) {
        console.error('Test Failed (Expected if using placeholders):', error.message);
    }
}

testSMS();
