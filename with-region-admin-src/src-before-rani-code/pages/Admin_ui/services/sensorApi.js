// src/services/sensorApi.js
import axios from 'axios';
import { serverUrl } from '../urls';

const API_BASE_URL = `${serverUrl}/api/sensors`; // Base URL for all sensor-related API calls

export const executeSensorAction = async (sensorName, action, payload = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${sensorName}/${action}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error executing ${action} for ${sensorName}:`, error);
        throw error;
    }
};
