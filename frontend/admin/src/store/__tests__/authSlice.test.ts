import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  setCredentials,
  setCsrfToken,
  setAccessToken,
  logout,
} from '../authSlice';

describe('Redux Slice: authSlice', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should_initialize_with_default_empty_state_when_no_session_exists', () => {
    const state = authReducer(undefined, { type: '@@INIT' });

    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuth).toBe(false);
    expect(state.csrfToken).toBeNull();
  });

  it('should_set_credentials_and_sync_with_sessionStorage_when_login_successful', () => {
    const mockUser = {
      id: 'admin-uuid-01',
      nomComplet: 'Admin MultiVerus',
      email: 'admin@multiverus.com',
      role: 'ADMIN' as const,
    };
    const mockToken = 'mock_jwt_access_token_xyz';

    const state = authReducer(
      undefined,
      setCredentials({ user: mockUser, accessToken: mockToken })
    );

    expect(state.isAuth).toBe(true);
    expect(state.accessToken).toBe(mockToken);
    expect(state.user).toEqual(mockUser);

    expect(sessionStorage.getItem('bwt_access_token')).toBe(mockToken);
    expect(sessionStorage.getItem('bwt_user')).toBe(JSON.stringify(mockUser));
  });

  it('should_store_csrf_token_in_state_when_setCsrfToken_is_dispatched', () => {
    const csrfValue = 'csrf_token_secret_12345';
    const state = authReducer(undefined, setCsrfToken(csrfValue));

    expect(state.csrfToken).toBe(csrfValue);
  });

  it('should_update_access_token_and_set_isAuth_when_token_refreshed', () => {
    const refreshedToken = 'new_refreshed_access_token_999';
    const state = authReducer(undefined, setAccessToken(refreshedToken));

    expect(state.accessToken).toBe(refreshedToken);
    expect(state.isAuth).toBe(true);
    expect(sessionStorage.getItem('bwt_access_token')).toBe(refreshedToken);
  });

  it('should_clear_all_credentials_and_session_data_when_logout_dispatched', () => {
    const initialState = {
      accessToken: 'token_to_clear',
      user: {
        id: 'user-1',
        nomComplet: 'Admin',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
      },
      isAuth: true,
      csrfToken: 'csrf_to_clear',
    };

    sessionStorage.setItem('bwt_access_token', 'token_to_clear');
    sessionStorage.setItem('bwt_user', JSON.stringify(initialState.user));

    const state = authReducer(initialState, logout());

    expect(state.isAuth).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.csrfToken).toBeNull();

    expect(sessionStorage.getItem('bwt_access_token')).toBeNull();
    expect(sessionStorage.getItem('bwt_user')).toBeNull();
  });
});
