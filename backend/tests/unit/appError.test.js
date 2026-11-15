const AppError = require('../../src/utils/appError');

describe('Utils: AppError', () => {
  it('should_create_operational_error_with_status_code_when_instantiated', () => {
    const error = new AppError('Ressource introuvable', 404, 'NOT_FOUND');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Ressource introuvable');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.isOperational).toBe(true);
  });

  it('should_default_code_to_null_when_code_is_omitted', () => {
    const error = new AppError('Erreur de validation', 400);

    expect(error.statusCode).toBe(400);
    expect(error.code).toBeNull();
    expect(error.isOperational).toBe(true);
  });
});
