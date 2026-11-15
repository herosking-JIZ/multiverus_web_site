const request = require('supertest');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');
const transporter = require('../../src/config/mail');

jest.mock('../../src/lib/prisma', () => ({
  lead: {
    create: jest.fn(),
  },
}));

jest.mock('../../src/config/mail', () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-mail-id-123' }),
}));

describe('Integration: Public Contact & Lead Submission Flow', () => {
  let csrfToken;
  let csrfCookie;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Récupération préalable du jeton CSRF et du cookie associé
    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];
  });

  it('should_reject_contact_form_when_validation_fails', async () => {
    const invalidPayload = {
      nomComplet: 'A', // Trop court (< 2 chars)
      email: 'invalid-email',
      sujet: '',
      message: 'Court', // Trop court (< 10 chars)
    };

    const res = await request(app)
      .post('/api/v1/contact')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body.statut).toBe('erreur');
    expect(res.body.message).toBe('Données invalides');
    expect(Array.isArray(res.body.erreurs)).toBe(true);
  });

  it('should_create_lead_and_trigger_email_when_valid_payload_submitted', async () => {
    const validPayload = {
      nomComplet: 'Alpha Oumar',
      email: 'alpha.oumar@multiverus.com',
      organisation: 'TechCorp SA',
      sujet: 'Demande de devis Audit Cloud',
      message: 'Bonjour, nous souhaitons planifier un audit technique complet de notre infrastructure.',
    };

    const mockSavedLead = {
      id: 'lead-uuid-0001',
      ...validPayload,
      statut: 'NOUVEAU',
      createdAt: new Date(),
    };

    prisma.lead.create.mockResolvedValueOnce(mockSavedLead);

    const res = await request(app)
      .post('/api/v1/contact')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('lead-uuid-0001');
    expect(prisma.lead.create).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalled();
  });
});
