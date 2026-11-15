// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_minimum_32_characters_long_for_security';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_minimum_32_characters_long_for_security';
process.env.COOKIE_SECRET = 'test_cookie_secret_minimum_32_characters_long_for_security';
process.env.CSRF_SECRET = 'test_csrf_secret_minimum_32_characters_long_for_security';
process.env.ADMIN_URL = 'http://localhost:5173';
process.env.PORTAL_URL = 'http://localhost:3000';
process.env.CRON_SECRET = 'test_cron_secret_1234567890';
process.env.SMTP_USER = 'test@multiverus.com';
process.env.SMTP_PASS = 'testpassword123';
process.env.ADMIN_EMAIL = 'admin@multiverus.com';

// Supprimer les logs bruyants pendant les tests
if (process.env.SILENT_TESTS === 'true') {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
}
