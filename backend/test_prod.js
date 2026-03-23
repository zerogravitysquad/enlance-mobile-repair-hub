const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testSubmit() {
    // 1. Login to get token
    const loginRes = await fetch('https://enlance-backend-vaishnavi.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "testuser5@example.com", password: "123" }) // using the user we just created, wait, we created on localhost 5001. We need a prod user, or just make a new one.
    });
    
    // Create an account on prod
    const regRes = await fetch('https://enlance-backend-vaishnavi.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Prod Test', email: `prod${Date.now()}@example.com`, password: 'password123', role: 'user', city: 'Test City', mobile: '1234567890' })
    });
    const regData = await regRes.json();
    console.log("Prod register:", regData);
    
    if(!regData.success) {
        console.error("Failed to register");
        return;
    }
    
    const token = regData.data.token;
    
    // 2. Submit Request
    const formData = new FormData();
    formData.append('brand', 'Apple');
    formData.append('model', 'iPhone 13');
    formData.append('description', 'Test issue');
    formData.append('city', 'Coimbatore');
    formData.append('area', 'RS Puram');
    
    fs.writeFileSync('temp.jpg', 'fake image bytes');
    formData.append('image', fs.createReadStream('temp.jpg'), {
        filename: 'issue-image.jpg',
        contentType: 'image/jpeg',
    });
    
    try {
        const submitRes = await fetch('https://enlance-backend-vaishnavi.onrender.com/api/request', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        
        const submitText = await submitRes.text();
        console.log("Prod submit status:", submitRes.status);
        console.log("Prod submit data:", submitText);
    } catch(e) {
        console.error("Fetch threw:", e);
    }
}

testSubmit();
