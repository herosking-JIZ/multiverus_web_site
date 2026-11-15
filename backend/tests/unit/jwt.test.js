const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../../src/utils/jwt');

describe('Utils: jwt', () => {
  const mockUser = {
    id: 'a0000000-0000-0000-0000-000000000001',
    role: 'ADMIN',
    email: 'admin@multiverus.com',
  };

  it('should_generate_valid_access_token_with_user_claims_when_user_provided', () => {
    const token = generateAccessToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.role).toBe(mockUser.role);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('should_generate_valid_refresh_token_with_user_id_when_user_provided', () => {
    const token = generateRefreshToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('should_throw_error_when_jwt_secret_missing_in_production_mode', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_ACCESS_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_ACCESS_SECRET;

      expect(() => {
        generateAccessToken(mockUser);
      }).toThrow('JWT_ACCESS_SECRET manquant en production');
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_ACCESS_SECRET = originalSecret;
    }
  });
});
