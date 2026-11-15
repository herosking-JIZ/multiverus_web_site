const { hashPassword, comparePassword } = require('../../src/utils/hash');

describe('Utils: hash', () => {
  it('should_hash_password_with_bcrypt_cost_12_when_plain_password_provided', async () => {
    const plain = 'SecretPassword123!';
    const hashed = await hashPassword(plain);

    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith('$2b$12$') || hashed.startsWith('$2a$12$')).toBe(true);
  });

  it('should_return_true_when_comparing_correct_password_with_hash', async () => {
    const plain = 'MySecurePass#2026';
    const hashed = await hashPassword(plain);

    const isMatch = await comparePassword(plain, hashed);
    expect(isMatch).toBe(true);
  });

  it('should_return_false_when_comparing_incorrect_password_with_hash', async () => {
    const plain = 'CorrectPassword';
    const wrong = 'WrongPassword';
    const hashed = await hashPassword(plain);

    const isMatch = await comparePassword(wrong, hashed);
    expect(isMatch).toBe(false);
  });
});
