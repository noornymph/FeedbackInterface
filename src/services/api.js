import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getUserInfo = async () => {
  try {
    const response = await api.get('/api/user/info/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const getFeedbacks = async (userId, page = 1) => {
  try {
    const response = await api.get(`/api/get-mentions/?user_id=${userId}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};

export const initiateGoogleLogin = () => {
  window.location.href = `${API_URL}/accounts/google/login/`;
};

export const summarizeFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback/summarize/', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error summarizing feedback:', error);
    throw error;
  }
};

export default api;