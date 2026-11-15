import axios from 'axios'

const configuredBaseURL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/v1' : 'https://multiverus-web-site.vercel.app/api/v1');
const baseURL = configuredBaseURL.startsWith('/') || /^https?:\/\//i.test(configuredBaseURL)
  ? configuredBaseURL
  : `https://${configuredBaseURL}`;

const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Variable globale pour stocker le token CSRF
let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

api.interceptors.request.use((config) => {
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data
      });
    }
    return Promise.reject(error)
  }
)

export default api
