const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');

jest.mock('../../src/lib/prisma', () => ({
  service: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
  auditLog: {
    create: jest.fn(),
  },
}));

describe('Integration: Services API Flow', () => {
  let csrfToken;
  let csrfCookie;
  let adminToken;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Jeton CSRF
    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];

    // Jeton Admin
    adminToken = jwt.sign(
      { id: 'admin-uuid-001', role: 'ADMIN', email: 'admin@multiverus.com' },
      process.env.JWT_ACCESS_SECRET
    );
  });

  describe('GET /api/v1/services (Public)', () => {
    it('should_return_active_services_list_when_publicly_requested', async () => {
      const mockServices = [
        { id: 's1', titre: 'Conseil & Stratégie', slug: 'conseil-strategie', actif: true },
        { id: 's2', titre: 'Cybersécurité', slug: 'cybersecurite', actif: true },
      ];

      prisma.service.findMany.mockResolvedValueOnce(mockServices);

      const res = await request(app).get('/api/v1/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('POST /api/v1/admin/services (Admin Guarded)', () => {
    it('should_return_401_unauthorized_when_no_bearer_token_provided', async () => {
      const res = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          titre: 'Cloud Architecture',
          description: 'Conception de plateformes cloud hautement disponibles.',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should_return_422_when_validation_fails_on_creation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titre: '', // Titre vide invalide
          description: 'Court', // < 10 caractères
        });

      expect(res.status).toBe(422);
      expect(res.body.statut).toBe('erreur');
    });

    it('should_create_service_with_201_when_payload_and_auth_are_valid', async () => {
      const newService = {
        titre: 'Infrastructure & Cloud',
        description: 'Déploiement et orchestration Kubernetes et Cloud sécurisé.',
      };

      prisma.service.findFirst.mockResolvedValueOnce(null); // Slug unique
      prisma.service.create.mockResolvedValueOnce({
        id: 'service-uuid-999',
        ...newService,
        slug: 'infrastructure-cloud',
        ordre: 0,
        actif: true,
      });

      const res = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newService);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('service-uuid-999');
      expect(res.body.data.slug).toBe('infrastructure-cloud');
      expect(prisma.service.create).toHaveBeenCalledTimes(1);
    });
  });
});
