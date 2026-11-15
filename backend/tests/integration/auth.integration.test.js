const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');
const { hashPassword } = require('../../src/utils/hash');

jest.mock('../../src/lib/prisma', () => ({
  utilisateur: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
}));

describe('Integration: Authentication Endpoints Flow', () => {
  let csrfToken;
  let csrfCookie;

  beforeEach(async () => {
    jest.clearAllMocks();

    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];
  });

  describe('POST /api/v1/auth/register', () => {
    it('should_reject_public_registration_with_403_by_default', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          nomComplet: 'Pirate Attempt',
          email: 'pirate@multiverus.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('désactivée pour des raisons de sécurité');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should_return_422_when_password_does_not_meet_complexity_requirements', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@multiverus.com',
          password: 'simple', // Pas de majuscule, chiffre ou caractère spécial
        });

      expect(res.status).toBe(422);
      expect(res.body.statut).toBe('erreur');
    });

    it('should_return_401_when_user_credentials_are_invalid', async () => {
      prisma.utilisateur.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'inconnu@multiverus.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Identifiants invalides');
    });

    it('should_return_200_with_jwt_and_set_httponly_cookie_when_login_successful', async () => {
      const plainPassword = 'SuperAdmin2026!';
      const hashedPassword = await hashPassword(plainPassword);

      const mockAdmin = {
        id: 'admin-uuid-001',
        nomComplet: 'Admin MultiVerus',
        email: 'admin@multiverus.com',
        motDePasse: hashedPassword,
        role: 'ADMIN',
        actif: true,
        tentativesEchec: 0,
        bloqueJusqua: null,
      };

      prisma.utilisateur.findUnique.mockResolvedValueOnce(mockAdmin);
      prisma.utilisateur.update.mockResolvedValueOnce(mockAdmin);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@multiverus.com',
          password: plainPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@multiverus.com');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should_clear_refresh_token_cookie_and_return_200_when_authenticated', async () => {
      const adminToken = jwt.sign(
        { id: 'admin-uuid-001', role: 'ADMIN', email: 'admin@multiverus.com' },
        process.env.JWT_ACCESS_SECRET
      );

      prisma.utilisateur.update.mockResolvedValueOnce({
        id: 'admin-uuid-001',
        refreshToken: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
