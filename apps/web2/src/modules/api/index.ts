import axios from 'axios';
import { getAuth as getFirebaseAuth } from 'firebase/auth';

import app from '../firebase';

const TIMEOUT_IN_MINS = 0.5;

const firebaseAuth = getFirebaseAuth(app);

const api = axios.create({
  baseURL: `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api`,
  timeout: TIMEOUT_IN_MINS * 60 * 1000,
  headers: {
    // Required by firebase when using an HTTP callable cloud function trigger
    'Content-Type': 'application/json',
  },
});

const _getAuthToken = async () => {
  if (!firebaseAuth.currentUser) {
    return '';
  }

  return await firebaseAuth.currentUser.getIdToken();
};

api.interceptors.request.use(async (config) => {
  if (config.method === 'post') {
    const token = await _getAuthToken();
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  return config;
});

export default api;
