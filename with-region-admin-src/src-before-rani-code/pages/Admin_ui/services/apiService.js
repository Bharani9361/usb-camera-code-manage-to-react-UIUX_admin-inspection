// src/services/apiService.js
import axios from 'axios';
import { serverUrl } from '../urls';

const apiClient = axios.create({
    baseURL: serverUrl, // Base URL for all API calls
    // timeout: 10000, // Timeout for requests (optional)
    headers: {
        'Content-Type': 'application/json', // Default headers
        'Access-Control-Allow-Origin': '*',
    },
});

// Utility function to handle API responses
const handleResponse = (response) => response.data;

// Utility function to handle errors
const handleError = (error) => {
    console.error('API Error:', error);
    throw error; // Re-throw the error for further handling
};

// Generic API functions
export const get = async (endpoint, params = {}) => {
    try {
        const response = await apiClient.get(endpoint, { params });
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

export const post = async (endpoint, data = {}) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

export const put = async (endpoint, data = {}) => {
    try {
        const response = await apiClient.put(endpoint, data);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

export const del = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};
