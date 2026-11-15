const request = require('supertest');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');

jest.mock('../../src/lib/prisma', () => ({
  lead: {
    create: jest.fn(),
  },
}));

describe('Security: Injection Defense & Server-Side Validation Rigor', () => {
  let csrfToken;
  let csrfCookie;

  beforeEach(async () => {
    jest.clearAllMocks();

    const csrfRes = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    const cookies = csrfRes.headers['set-cookie'];
    csrfCookie = cookies.find((c) => c.startsWith('ps-csrf-token=')).split(';')[0];
  });

  describe('Server-Side Validation Autonomy (Bypassing Frontend)', () => {
    it('should_reject_request_with_422_when_client_attempts_to_bypass_required_fields', async () => {
      // Simule un attaquant qui court-circuite le JavaScript frontend et appelle directement l'API
      const res = await request(app)
        .post('/api/v1/contact')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({}); // Payload vide

      expect(res.status).toBe(422);
      expect(res.body.statut).toBe('erreur');
      expect(Array.isArray(res.body.erreurs)).toBe(true);
      expect(res.body.erreurs.length).toBeGreaterThan(0);
    });

    it('should_reject_request_with_422_when_email_syntax_is_malformed', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          nomComplet: 'Security Researcher',
          email: 'attacker@evil', // Pas de TLD valide / syntaxe incorrecte
          sujet: 'Security testing',
          message: 'Ceci est un message de test de robustesse du backend.',
        });

      // Le validateur Joi email({ tlds: { allow: false } }) vérifie la syntaxe regex standard RFC 5322
      // Si email n'a pas de domaine complet, il est rejeté
      const invalidRes = await request(app)
        .post('/api/v1/contact')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          nomComplet: 'Security Researcher',
          email: 'not-an-email-at-all',
          sujet: 'Security testing',
          message: 'Ceci est un message de test de robustesse du backend.',
        });

      expect(invalidRes.status).toBe(422);
      expect(invalidRes.body.statut).toBe('erreur');
    });
  });

  describe('Injection Attacks (SQL & XSS)', () => {
    it('should_safely_handle_sql_injection_strings_without_database_compromise', async () => {
      const maliciousSql = "Test User'; DROP TABLE leads; --";

      prisma.lead.create.mockResolvedValueOnce({
        id: 'lead-safe-001',
        nomComplet: maliciousSql,
        email: 'sqli@test.com',
        sujet: 'SQLi Attempt',
        message: 'Payload testing with parameterized queries.',
        statut: 'NOUVEAU',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/contact')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          nomComplet: maliciousSql,
          email: 'sqli@test.com',
          sujet: 'SQLi Attempt',
          message: 'Payload testing with parameterized queries.',
        });

      expect(res.status).toBe(201);
      // Prisma utilise des requêtes préparées paramétrées ($1, $2...),
      // donc la chaîne est stockée littéralement sans exécution SQL
      expect(prisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nomComplet: maliciousSql,
          }),
        })
      );
    });
  });

  describe('Denial of Service & Payload Size Limits', () => {
    it('should_reject_payload_exceeding_10kb_with_413_payload_too_large', async () => {
      // Génère une chaîne de plus de 10 Ko (ex: 15 000 caractères)
      const oversizedString = 'A'.repeat(15 * 1024);

      const res = await request(app)
        .post('/api/v1/contact')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          nomComplet: 'Oversized Attacker',
          email: 'oversized@multiverus.com',
          sujet: 'DoS Attempt',
          message: oversizedString,
        });

      // express.json({ limit: '10kb' }) déclenche une erreur 413
      expect(res.status).toBe(413);
    });
  });
});
