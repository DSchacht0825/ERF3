// API Configuration
// Automatically uses the correct API URL for local development or production

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

export const API_URL = isDevelopment
  ? 'http://localhost:3001/api'  // Local development
  : '/api';                        // Production (Vercel)

export const config = {
  API_URL,
  isProduction,
  isDevelopment
};

export default config;
