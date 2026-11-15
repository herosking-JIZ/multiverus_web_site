import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
});

describe('Validation Schema: Login (Zod)', () => {
  it('should_fail_validation_when_email_is_invalid', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'ValidPassword123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email invalide');
    }
  });

  it('should_fail_validation_when_password_has_less_than_8_chars', () => {
    const result = loginSchema.safeParse({
      email: 'admin@multiverus.com',
      password: 'Pass1!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('au moins 8 caractères');
    }
  });

  it('should_fail_validation_when_password_misses_special_character', () => {
    const result = loginSchema.safeParse({
      email: 'admin@multiverus.com',
      password: 'Password1234',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('caractère spécial');
    }
  });

  it('should_pass_validation_when_email_and_password_meet_all_constraints', () => {
    const result = loginSchema.safeParse({
      email: 'admin@multiverus.com',
      password: 'SuperAdmin#2026!',
    });

    expect(result.success).toBe(true);
  });
});
