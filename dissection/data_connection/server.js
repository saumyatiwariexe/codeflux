const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const API_BASE = 'https://mobileapi.lpu.in';

function decodeJWT(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
}

app.post('/api/test-login', async (req, res) => {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
        return res.status(400).json({ success: false, error: "Missing credentials" });
    }

    console.log(`\n[PROXY] Attempting to auth user: ${regNo}`);
    
    // We know from testing that Payload 3 is the winner.
    const payload = { Username: regNo, Password: password, DEVICE_ID: "Paladeium-Test" };

    try {
        // 1. Get Token
        console.log(`[PROXY] 1. Fetching JWT Token...`);
        const tokenResponse = await axios.post(`${API_BASE}/security/createToken`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4) LPUTouch/23.45'
            },
            timeout: 8000
        });

        const tokenData = tokenResponse.data;

        if (tokenData.status === true && tokenData.token) {
            console.log(`\x1b[32m[PROXY] [SUCCESS] Token secured.\x1b[0m`);
            const decodedProfile = decodeJWT(tokenData.token);
            
            // 2. Fetch extra profile / menu data from /api/Menu/UPS
            console.log(`[PROXY] 2. Fetching user permissions & extra data from /api/Menu/UPS...`);
            let upsData = null;
            try {
                // The API might expect 'NToken' or 'Authorization: Bearer' in headers. 
                // We'll pass it in both to be safe based on standard .NET mobile patterns.
                const upsResponse = await axios.post(`${API_BASE}/api/Menu/UPS`, {
                    Token: tokenData.token,
                    NToken: tokenData.token,
                    RegistrationNo: regNo,
                    DEVICE_ID: "Paladeium-Test"
                }, {
                    headers: {
                        'NToken': tokenData.token,
                        'Authorization': `Bearer ${tokenData.token}`,
                        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4) LPUTouch/23.45'
                    },
                    timeout: 8000
                });
                upsData = upsResponse.data;
                console.log(`\x1b[32m[PROXY] [SUCCESS] Extra data fetched.\x1b[0m`);
            } catch (upsErr) {
                console.log(`\x1b[31m[PROXY] [WARNING] Failed to fetch UPS data: ${upsErr.message}\x1b[0m`);
                upsData = { error: "Failed to fetch extended profile", details: upsErr.message };
            }

            return res.json({
                success: true,
                message: "Authentication Successful & Data Scraped",
                scraped_data: {
                    basic_profile: decodedProfile,
                    extended_menu_permissions: upsData
                },
                raw_token: tokenData.token
            });

        } else {
            console.log(`\x1b[31m[PROXY] [ERROR] Login Failed: ${tokenData.message}\x1b[0m`);
            return res.status(401).json({
                success: false,
                message: "Login failed with LPU servers.",
                raw_response: tokenData
            });
        }

    } catch (error) {
        console.log(`\x1b[31m[PROXY] [ERROR] ${error.message}\x1b[0m`);
        const lpuResponse = error.response ? error.response.data : null;
        return res.status(error.response ? error.response.status : 500).json({
            success: false,
            message: "Connection Error",
            error: error.message,
            lpu_response: lpuResponse
        });
    }
});

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`\x1b[32m[START] Paladeium Data Scraper Proxy is RUNNING\x1b[0m`);
    console.log(`   Listening at http://localhost:${PORT}`);
    console.log(`==========================================`);
});
