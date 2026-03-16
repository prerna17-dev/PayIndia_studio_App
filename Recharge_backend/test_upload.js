const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzcyNzc3MTI0LCJleHAiOjE3NzI3ODA3MjR9.Fhu3oQYUL0t3w5fEIse9Vavs7g9peMtubztijJyJUcs';

async function testUpload() {
    // Create a dummy file
    fs.writeFileSync('test_doc.txt', 'test content');

    console.log('--- Testing WITH manual Content-Type (No Boundary) ---');
    const formData1 = new FormData();
    formData1.append('full_name', 'Test User 1');
    formData1.append('aadhaar_number', '123456789012');
    formData1.append('mobile_number', '1234567890');
    formData1.append('annual_income', '100000');
    formData1.append('dob', '01/01/1990');
    formData1.append('gender', 'Male');
    formData1.append('occupation', 'Service');
    formData1.append('income_source', 'Test Source');
    formData1.append('purpose', 'Education');
    formData1.append('house_no', '123');
    formData1.append('street', 'Test Street');
    formData1.append('village', 'Test Village');
    formData1.append('taluka', 'Test Taluka');
    formData1.append('district', 'Test District');
    formData1.append('state', 'Maharashtra');
    formData1.append('pincode', '123456');
    formData1.append('aadhaar_card', fs.createReadStream('test_doc.txt'));

    try {
        const res = await axios.post('http://localhost:5000/api/certificate/income/apply', formData1, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        console.log('Success (Manual Header):', res.data.success);
    } catch (err) {
        console.error('Error (Manual Header):', err.response ? err.response.data : err.message);
    }

    console.log('\n--- Testing WITHOUT manual Content-Type (Auto Boundary) ---');
    const formData2 = new FormData();
    formData2.append('full_name', 'Test User 2');
    formData2.append('aadhaar_number', '123456789012');
    formData2.append('mobile_number', '1234567890');
    formData2.append('annual_income', '100000');
    formData2.append('dob', '01/01/1990');
    formData2.append('gender', 'Male');
    formData2.append('occupation', 'Service');
    formData2.append('income_source', 'Test Source');
    formData2.append('purpose', 'Education');
    formData2.append('house_no', '123');
    formData2.append('street', 'Test Street');
    formData2.append('village', 'Test Village');
    formData2.append('taluka', 'Test Taluka');
    formData2.append('district', 'Test District');
    formData2.append('state', 'Maharashtra');
    formData2.append('pincode', '123456');
    formData2.append('aadhaar_card', fs.createReadStream('test_doc.txt'));

    try {
        const res = await axios.post('http://localhost:5000/api/certificate/income/apply', formData2, {
            headers: {
                ...formData2.getHeaders(), // For Node.js we need this, but in React Native Axios does it
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        console.log('Success (Auto Header):', res.data.success);
    } catch (err) {
        console.error('Error (Auto Header):', err.response ? err.response.data : err.message);
    }
}

testUpload();
