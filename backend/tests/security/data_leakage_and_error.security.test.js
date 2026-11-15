const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');
const { hashPassword } = require('../../src/utils/hash');

jest.mock('../../src/lib/prisma', () => ({
  utilisateur: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
}));

describe('Security: Data Leakage & Information Disclosure Defense', () => {
  let csrfToken;
  let csrfCookie;
  let adminToken;

  beforeEach(async () => {
    jest.clearAllMocks();

    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];

    adminToken = jwt.sign(
      { id: 'admin-uuid-001', role: 'ADMIN', email: 'admin@multiverus.com' },
      process.env.JWT_ACCESS_SECRET
    );
  });

  describe('IDOR / BOLA Prevention (Insecure Direct Object Reference)', () => {
    it('should_block_non_admin_user_from_accessing_another_users_profile_with_403', async () => {
      const victimId = 'victim-uuid-999';
      const attackerToken = jwt.sign(
        { id: 'attacker-uuid-111', role: 'LECTEUR', email: 'attacker@multiverus.com' },
        process.env.JWT_ACCESS_SECRET
      );

      const res = await request(app)
        .get(`/api/v1/users/me/${victimId}`)
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("consulter le profil d'un autre utilisateur");
    });

    it('should_allow_user_to_access_their_own_profile', async () => {
      const myId = 'my-own-uuid-123';
      const myToken = jwt.sign(
        { id: myId, role: 'LECTEUR', email: 'me@multiverus.com' },
        process.env.JWT_ACCESS_SECRET
      );

      prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: myId,
        nomComplet: 'Mon Profil',
        email: 'me@multiverus.com',
        role: 'LECTEUR',
        actif: true,
      });

      const res = await request(app)
        .get(`/api/v1/users/me/${myId}`)
        .set('Authorization', `Bearer ${myToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(myId);
    });

    it('should_allow_admin_to_access_any_users_profile', async () => {
      const targetUserId = 'target-uuid-555';

      prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: targetUserId,
        nomComplet: 'Cible User',
        email: 'cible@multiverus.com',
        role: 'LECTEUR',
        actif: true,
      });

      const res = await request(app)
        .get(`/api/v1/users/me/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(targetUserId);
    });
  });

  describe('Sensitive Fields Redaction in API Responses', () => {
    it('should_never_expose_password_or_tokens_in_users_list_response', async () => {
      prisma.utilisateur.findMany.mockResolvedValueOnce([
        {
          id: 'user-001',
          nomComplet: 'Directeur Général',
          email: 'dg@multiverus.com',
          role: 'ADMIN',
          actif: true,
          lastLogin: new Date(),
          createdAt: new Date(),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const user = res.body.data[0];

      // Vérification rigoureuse de non-divulgation
      expect(user.motDePasse).toBeUndefined();
      expect(user.password).toBeUndefined();
      expect(user.refreshToken).toBeUndefined();
      expect(user.resetPasswordToken).toBeUndefined();
    });

    it('should_never_expose_password_or_refresh_token_in_login_response_body', async () => {
      const plainPassword = 'SuperPassword2026!';
      const hashedPassword = await hashPassword(plainPassword);

      const mockUser = {
        id: 'admin-uuid-001',
        nomComplet: 'Admin System',
        email: 'admin@multiverus.com',
        role: 'ADMIN',
        motDePasse: hashedPassword,
        actif: true,
        tentativesEchec: 0,
        bloqueJusqua: null,
      };

      prisma.utilisateur.findUnique.mockResolvedValueOnce(mockUser);
      prisma.utilisateur.update.mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@multiverus.com',
          password: plainPassword,
        });

      expect(res.status).toBe(200);
      const { data } = res.body;

      // Le refresh token ne doit JAMAIS transiter dans le corps JSON (uniquement cookie HttpOnly)
      expect(data.refreshToken).toBeUndefined();
      expect(data.user.motDePasse).toBeUndefined();
      expect(data.user.password).toBeUndefined();
    });
  });

  describe('Internal Exception Information Shielding (NODE_ENV=production)', () => {
    it('should_not_leak_stack_traces_or_database_internals_in_production_mode', async () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'production';

        // Simule une exception interne de base de données non interceptée
        prisma.utilisateur.findMany.mockRejectedValueOnce(
          new Error('FATAL: password authentication failed for user "postgres" at line 452')
        );

        const res = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);

        // En production, le message doit être opaque
        expect(res.body.message).toBe('Une erreur interne est survenue.');
        expect(res.body.stack).toBeUndefined();
        expect(res.body.error).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
