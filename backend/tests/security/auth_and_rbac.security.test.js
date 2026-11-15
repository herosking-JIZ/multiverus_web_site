const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');

jest.mock('../../src/lib/prisma', () => ({
  service: {
    findMany: jest.fn(),
  },
  utilisateur: {
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
}));

describe('Security: Authentication & RBAC Boundaries', () => {
  let csrfToken;
  let csrfCookie;

  beforeEach(async () => {
    jest.clearAllMocks();

    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];
  });

  describe('Missing or Malformed Authentication Headers', () => {
    it('should_reject_with_401_when_protected_admin_endpoint_called_without_authorization_header', async () => {
      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("token d'accès manquant");
    });

    it('should_reject_with_401_when_authorization_header_has_unsupported_scheme', async () => {
      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("token d'accès manquant ou format invalide");
    });

    it('should_reject_with_401_when_bearer_token_is_empty', async () => {
      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Forged, Expired or Untrusted Tokens', () => {
    it('should_reject_with_401_when_jwt_signature_has_been_tampered_with', async () => {
      const validPayload = { id: 'admin-uuid', role: 'ADMIN', email: 'admin@multiverus.com' };
      const validToken = jwt.sign(validPayload, process.env.JWT_ACCESS_SECRET);

      // Altération du corps du token (tampering)
      const parts = validToken.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;

      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalide ou expiré');
    });

    it('should_reject_with_401_when_jwt_is_expired', async () => {
      // Token avec expiration dans le passé (ex: -10 secondes)
      const expiredToken = jwt.sign(
        { id: 'admin-uuid', role: 'ADMIN' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalide ou expiré');
    });

    it('should_reject_with_401_when_jwt_is_signed_with_untrusted_secret', async () => {
      const attackerSecret = 'attacker_private_secret_key_32_characters';
      const fakeToken = jwt.sign(
        { id: 'attacker-uuid', role: 'ADMIN', email: 'attacker@evil.com' },
        attackerSecret
      );

      const res = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should_reject_with_403_when_authenticated_user_lacks_admin_role_on_admin_routes', async () => {
      const readerToken = jwt.sign(
        { id: 'reader-uuid', role: 'LECTEUR', email: 'lecteur@multiverus.com' },
        process.env.JWT_ACCESS_SECRET
      );

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('privilèges Administrateur requis');
    });
  });
});
