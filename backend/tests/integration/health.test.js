const request = require('supertest');
const app = require('../../app');
const prisma = require('../../src/lib/prisma');

jest.mock('../../src/lib/prisma', () => ({
  $queryRaw: jest.fn(),
}));

describe('Integration: Health & Public Core Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should_return_200_welcome_payload_when_root_url_is_called', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('MultiVerus'),
          version: 'v1',
          endpoints: expect.any(Object),
        })
      );
    });
  });

  describe('GET /api/v1', () => {
    it('should_return_200_api_index_when_base_api_route_is_called', async () => {
      const res = await request(app).get('/api/v1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: true,
          name: 'MultiVerus API',
          status: 'running',
        })
      );
    });
  });

  describe('GET /api/v1/health', () => {
    it('should_return_200_healthy_when_database_is_connected', async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([{ connected: 1 }])
        .mockResolvedValueOnce([
          { table_name: 'utilisateurs' },
          { table_name: 'services' },
          { table_name: 'produits' },
        ]);

      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.connected).toBe(true);
      expect(res.body.database.tablesCount).toBe(3);
    });

    it('should_return_503_unhealthy_when_database_query_fails', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused to postgres:5432'));

      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.status).toBe('unhealthy');
      expect(res.body.database.connected).toBe(false);
      expect(res.body.database.error).toContain('Connection refused');
    });
  });

  describe('Route Not Found (404)', () => {
    it('should_return_404_app_error_when_requesting_an_unknown_endpoint', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint-xyz');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('est introuvable');
    });
  });
});
