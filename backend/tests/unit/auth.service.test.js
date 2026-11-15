const authService = require('../../src/services/auth.service');
const prisma = require('../../src/lib/prisma');
const { hashPassword, comparePassword } = require('../../src/utils/hash');

jest.mock('../../src/lib/prisma', () => ({
  utilisateur: {
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Service: AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should_throw_error_when_maximum_users_limit_reached', async () => {
      prisma.utilisateur.count.mockResolvedValueOnce(10);

      await expect(
        authService.register({
          nomComplet: 'Nouveau Lecteur',
          email: 'nouveau@multiverus.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('limite maximale de 10 administrateurs est atteinte');
    });

    it('should_throw_error_when_email_already_exists', async () => {
      prisma.utilisateur.count.mockResolvedValueOnce(2);
      prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        email: 'existant@multiverus.com',
      });

      await expect(
        authService.register({
          nomComplet: 'Lecteur Doublon',
          email: 'existant@multiverus.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('déjà associé à un compte');
    });

    it('should_create_user_with_lecteur_role_when_registration_data_valid', async () => {
      prisma.utilisateur.count.mockResolvedValueOnce(3);
      prisma.utilisateur.findUnique.mockResolvedValueOnce(null);
      prisma.utilisateur.create.mockResolvedValueOnce({
        id: 'user-uuid-1234',
        nomComplet: 'Mamadou Diallo',
        email: 'mamadou@multiverus.com',
        role: 'LECTEUR',
        actif: true,
      });

      const result = await authService.register({
        nomComplet: 'Mamadou Diallo',
        email: 'mamadou@multiverus.com',
        password: 'SecurePassword123!',
      });

      expect(result).toEqual({
        id: 'user-uuid-1234',
        nomComplet: 'Mamadou Diallo',
        email: 'mamadou@multiverus.com',
        role: 'LECTEUR',
      });
      expect(prisma.utilisateur.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'LECTEUR',
            email: 'mamadou@multiverus.com',
          }),
        })
      );
    });
  });

  describe('login', () => {
    it('should_throw_error_when_user_does_not_exist', async () => {
      prisma.utilisateur.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.login('inexistant@multiverus.com', 'Pass123!')
      ).rejects.toThrow('Identifiants invalides');
    });

    it('should_throw_error_when_user_account_is_deactivated', async () => {
      prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: 'user-deactivated',
        email: 'desactive@multiverus.com',
        actif: false,
      });

      await expect(
        authService.login('desactive@multiverus.com', 'Pass123!')
      ).rejects.toThrow('Compte désactivé');
    });

    it('should_throw_error_when_account_is_temporarily_blocked', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: 'user-blocked',
        email: 'bloque@multiverus.com',
        actif: true,
        bloqueJusqua: futureDate,
      });

      await expect(
        authService.login('bloque@multiverus.com', 'Pass123!')
      ).rejects.toThrow('Compte bloqué suite à trop de tentatives');
    });

    it('should_reset_failed_attempts_and_return_tokens_when_credentials_are_valid', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      const mockUser = {
        id: 'user-admin-01',
        nomComplet: 'Super Administrateur',
        email: 'admin@multiverus.com',
        role: 'ADMIN',
        motDePasse: hashedPassword,
        actif: true,
        tentativesEchec: 2,
        bloqueJusqua: null,
      };

      prisma.utilisateur.findUnique.mockResolvedValueOnce(mockUser);
      prisma.utilisateur.update.mockResolvedValueOnce(mockUser);

      const result = await authService.login('admin@multiverus.com', plainPassword);

      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      expect(prisma.utilisateur.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            tentativesEchec: 0,
            bloqueJusqua: null,
          }),
        })
      );
    });
  });
});
