const isAdmin = require('../../src/middlewares/role.middleware');

describe('Middleware: isAdmin', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should_call_next_when_user_has_admin_role', () => {
    req.user = { id: 'user-123', role: 'ADMIN' };

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should_return_403_when_req_user_is_missing', () => {
    req.user = null;

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('privilèges Administrateur requis'),
      })
    );
  });

  it('should_return_403_when_user_role_is_not_admin', () => {
    req.user = { id: 'user-456', role: 'LECTEUR' };

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });
});
