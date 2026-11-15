const jwt = require('jsonwebtoken');
const verifyToken = require('../../src/middlewares/auth.middleware');

describe('Middleware: verifyToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should_return_401_when_authorization_header_is_missing', () => {
    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("token d'accès manquant"),
      })
    );
  });

  it('should_return_401_when_authorization_header_does_not_start_with_bearer', () => {
    req.headers.authorization = 'Basic dXNlcjpwYXNz';

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should_attach_decoded_payload_and_call_next_when_token_is_valid', () => {
    const payload = { id: 'user-789', role: 'ADMIN', email: 'test@multiverus.com' };
    const validToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET);
    req.headers.authorization = `Bearer ${validToken}`;

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(payload.id);
    expect(req.user.role).toBe(payload.role);
  });

  it('should_return_401_when_token_is_invalid_or_expired', () => {
    req.headers.authorization = 'Bearer this.is.an.invalid.token';

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('invalide ou expiré'),
      })
    );
  });
});
