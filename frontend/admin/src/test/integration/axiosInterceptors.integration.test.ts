import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { store } from '../../store';
import { setCredentials, logout } from '../../store/authSlice';
import adminApi, { clearCsrfCache } from '../../lib/axios';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
      post: vi.fn(),
      create: actual.default.create,
    },
  };
});

describe('Integration: Admin Axios Interceptors Pipeline', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearCsrfCache();
    store.dispatch(logout());
    vi.clearAllMocks();
  });

  it('should_inject_bearer_token_when_access_token_exists_in_session', async () => {
    const mockToken = 'valid_session_jwt_token_123';
    sessionStorage.setItem('bwt_access_token', mockToken);

    // Mock de l'appel CSRF et de l'appel effectif
    (axios.get as any).mockResolvedValueOnce({
      data: { success: true, csrfToken: 'csrf_valid_token_abc' },
    });

    // Simule une requête via le handler d'intercepteur
    const requestInterceptor = (adminApi.interceptors.request as any).handlers[0].fulfilled;

    const config = await requestInterceptor({
      url: '/admin/services',
      headers: {},
    });

    expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
    expect(config.headers['x-csrf-token']).toBe('csrf_valid_token_abc');
  });

  it('should_not_inject_authorization_header_when_url_is_login', async () => {
    sessionStorage.setItem('bwt_access_token', 'token_should_not_be_sent');

    (axios.get as any).mockResolvedValueOnce({
      data: { success: true, csrfToken: 'csrf_valid_token_abc' },
    });

    const requestInterceptor = (adminApi.interceptors.request as any).handlers[0].fulfilled;

    const config = await requestInterceptor({
      url: '/auth/login',
      headers: {},
    });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should_clear_csrf_cache_when_response_is_403_csrf_error', async () => {
    const responseErrorInterceptor = (adminApi.interceptors.response as any).handlers[0].rejected;

    const mock403Error = {
      config: { url: '/admin/produits' },
      response: {
        status: 403,
        data: {
          success: false,
          message: 'invalid csrf token',
        },
      },
    };

    await expect(responseErrorInterceptor(mock403Error)).rejects.toEqual(mock403Error);

    // Le store doit avoir son csrfToken réinitialisé à null
    expect(store.getState().auth.csrfToken).toBeNull();
  });
});
