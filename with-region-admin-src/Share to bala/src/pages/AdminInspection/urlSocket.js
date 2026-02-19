import { create } from 'axios'

var urlSocket = create({

    // baseURL: 'https://www.incidentum.com:9090',
    // baseURL: 'https://localhost:5054',
    // baseURL: 'https://localhost:5007',
    baseURL: 'https://172.16.1.117:5007',
    // baseURL: 'https://172.16.1.193:5054',

    //mode: 'no-cors',
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', },
    // timeout: 20000000,
    // timeout: 10000,

})


export default urlSocket
