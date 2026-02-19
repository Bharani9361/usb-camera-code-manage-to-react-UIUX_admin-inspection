// src/constants/apiUrls.js
import { create } from 'axios'

export const urlSocket = create({
    baseURL: 'https://172.16.1.172:5005',  // Admin -H
    // mode: 'no-cors',
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', },
    // timeout: 20000000,
});

export const img_url = 'https://172.16.1.172:8001/' // Admin -H
