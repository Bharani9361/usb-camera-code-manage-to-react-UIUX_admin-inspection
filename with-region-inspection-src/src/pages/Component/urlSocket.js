import { create } from 'axios';
import { apiUrl } from 'context/urls';

var urlSocket = create({
    
    baseURL: apiUrl,
    // baseURL: 'https://localhost:5055',
    // baseURL: 'https://172.16.1.197:5050',
    
    //mode: 'no-cors',
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', },
    // timeout: 20000000,
    // timeout: 10000,

})

export default urlSocket
