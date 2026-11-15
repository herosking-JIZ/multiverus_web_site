const request = require('supertest');
const app = require('../../app');

describe('Integration: CSRF Protection Flow', () => {
  it('should_issue_a_csrf_token_and_set_cookie_when_calling_csrf_endpoint', async () => {
    const res = await request(app).get('/api/v1/csrf-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(10);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasCsrfCookie = cookies.some((c) => c.includes('ps-csrf-token'));
    expect(hasCsrfCookie).toBe(true);
  });

  it('should_reject_post_request_with_403_when_csrf_token_is_missing_on_mutating_route', async () => {
    const res = await request(app)
      .post('/api/v1/admin/services')
      .send({ titre: 'Hacking attempt' });

    // double-csrf protection returns 403 when CSRF is missing or invalid on protected routes
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
