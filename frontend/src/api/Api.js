import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Your backend URL

export const signup = async (userData) => {
    return axios.post(`${API_URL}/auth/register`, userData);
};

export const login = async (credentials) => {
    return axios.post(`${API_URL}/auth/login`, credentials);
};

export const fetchBooks = async () => {
    return axios.get(`${API_URL}/book`);
};

export const fetchVideos = async () => {
    return axios.get(`${API_URL}/videos`);
};

export const purchaseBook = async (purchaseData, token) => {
    return axios.post(`${API_URL}/purchase`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
