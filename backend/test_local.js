const fs = require('fs');

async function testSubmit() {
    try {
        // 1. Register a new user to get a token
        const reqReg = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Local Test', email: `local${Date.now()}@example.com`, password: 'password123', role: 'user', city: 'Test City', mobile: '1234567890' })
        });
        const regData = await reqReg.json();
        const token = regData.data.token;
        console.log("Registered user, got token.", regData.success);

        // 2. Submit a repair request using FormData
        const formData = new FormData();
        formData.append('brand', 'Apple');
        formData.append('model', 'iPhone 13');
        formData.append('description', 'Test issue');
        formData.append('city', 'Coimbatore');
        formData.append('area', 'RS Puram');

        fs.writeFileSync('temp.jpg', 'fake image bytes');
        
        // Convert to Blob for node native fetch FormData
        const buffer = fs.readFileSync('temp.jpg');
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('image', blob, 'issue-image.jpg');

        const submitRes = await fetch('http://localhost:5001/api/request', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        
        const submitText = await submitRes.text();
        console.log("Submit status:", submitRes.status);
        console.log("Submit data:", submitText);
    } catch(e) {
        console.error("Fetch threw:", e);
    }
}

testSubmit();
