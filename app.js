const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 500;
const NUMBERS_API_URL = 'http://localhost:9876/numbers/e'; 

let window = [1,2,3,4,5];

const fetchNumbers = async (numberid) => {
    try {
        const response = await axios.get(`${NUMBERS_API_URL}${numberid}`, { timeout: TIMEOUT });
        return response.data.numbers || [];
    } catch (error) {
        return [];
    }
};

const updateWindow = (newNumbers) => {
    const uniqueNewNumbers = newNumbers.filter(num => !window.includes(num));
    window = [...window, ...uniqueNewNumbers].slice(-WINDOW_SIZE);
};

app.get('/numbers/:numberid', async (req, res) => {
    const start = Date.now();
    const numberid = req.params.numberid;

    const prevWindowState = [...window];
    const newNumbers = await fetchNumbers(numberid);

    updateWindow(newNumbers);

    const currentWindowState = [...window];
    const avg = window.length > 0 ? window.reduce((sum, num) => sum + num, 0) / window.length : 0;

    const response = {
        windowPrevState: prevWindowState,
        windowCurrState: currentWindowState,
        numbers: newNumbers,
        avg: parseFloat(avg.toFixed(2)),
    };

    const elapsedTime = Date.now() - start;
    const delay = TIMEOUT - elapsedTime;
    
    if (delay > 0) {
        setTimeout(() => res.json(response), delay);
    } else {
        res.json(response);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
