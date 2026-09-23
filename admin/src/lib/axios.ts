import axios from 'axios'
import { store } from '../store'
import { setCsrfToken, setAccessToken, logout } from '../store/authSlice'

const baseURL = import.meta.env.VITE_API_URL || 'http://100.119.90.39:3000/api/v1';

const adminApi = axios.create({
  baseURL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

let csrfTokenPromise: Promise<string | null> | null = null;

export const clearCsrfCache = () => {
  csrfTokenPromise = null;
  store.dispatch(setCsrfToken(null));
};

const getCsrfToken = async () => {
  const { csrfToken } = store.getState().auth;

  if (csrfToken && csrfTokenPromise) return csrfToken;

  if (!csrfTokenPromise) {
    csrfTokenPromise = axios.get(`${baseURL}/csrf-token`, {
      withCredentials: true,
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        const token = res.data?.csrfToken || res.data?.data?.csrfToken;
        if (token) {
          store.dispatch(setCsrfToken(token));
          return token;
        }
        console.error('CSRF Token missing in response:', res.data);
        return null;
      })
      .catch((err) => {
        console.error('Failed to fetch CSRF token:', err);
        csrfTokenPromise = null;
        return null;
      });
  }
  return csrfTokenPromise;
};

adminApi.interceptors.request.use(async (config) => {
  // Authorization header logic - avoid sending on login
  const isLoginRoute = config.url?.includes('/auth/login');
  const token = sessionStorage.getItem('bwt_access_token');

  if (token && !isLoginRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Inject CSRF except for the token fetch itself
  if (!config.url?.includes('csrf-token')) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      // Pour une compatibilité absolue (certains serveurs sont sensibles à la casse)
      config.headers['x-csrf-token'] = csrfToken;
      //config.headers['cookie'] = `ps-csrf-token=${csrfToken}`;
    } else {
      console.warn('[Axios] Proceeding without CSRF token (fetch failed)');
    }
  }

  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // Doc says POST /auth/refresh-token
        const { data: response } = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )
        // Doc says response is { success: true, data: { accessToken: "..." } }
        const newAccessToken = response.data?.accessToken;

        if (newAccessToken) {
          sessionStorage.setItem('bwt_access_token', newAccessToken)
          store.dispatch(setAccessToken(newAccessToken))
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return adminApi.request(originalRequest)
        }
      } catch (err) {
        console.error('Refresh token failed:', err);
        store.dispatch(logout())
        window.location.href = '/login'
      }
    }

    // Effacer le cache CSRF si le backend nous renvoie une erreur pertinente
    if (error.response?.status === 403) {
      console.error('Access Forbidden (403):', error.response.data);
      if (error.response?.data?.message?.toLowerCase().includes('csrf')) {
        clearCsrfCache();
      }
    }

    return Promise.reject(error)
  }
)

// Récupération préemptive immédiate : 
// Lance la requête `/csrf-token` dès le chargement du fichier (avant les autres appels axios)
getCsrfToken().catch(() => { });

export default adminApi
