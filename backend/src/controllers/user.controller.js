const prisma = require('../lib/prisma');
const { hashPassword } = require('../utils/hash');

// Tracabilité stricte des actions admin
const logAdminAction = async (req, action, cibleId, detail) => {
    if (!req.user || !req.user.id) return;
    try {
        await prisma.auditLog.create({
            data: {
                utilisateurId: req.user.id, // L'ID de l'admin qui fait l'action
                action: action,
                entiteCible: 'UTILISATEUR',
                entiteId: cibleId,
                detail: { ip: req.ip, ...detail }
            }
        });
    } catch (err) { }
};

class UserController {
    async getUserById(req, res, next) {

        try {
            const { id } = req.params;
            const user = await prisma.utilisateur.findUnique({
                where: { id },
                select: { id: true, nomComplet: true, email: true, role: true, actif: true, lastLogin: true, createdAt: true }
            });
            return res.status(200).json({ success: true, data: user });
        } catch (error) { next(error); }
    }

    async getUsers(req, res, next) {

        try {
            const users = await prisma.utilisateur.findMany({
                select: { id: true, nomComplet: true, email: true, role: true, actif: true, lastLogin: true, createdAt: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json({ success: true, data: users });
        } catch (error) { next(error); }
    }

    async createUser(req, res, next) {
        try {
            const { nomComplet, email, role, motDePasse } = req.body;
            const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
            if (existingUser) return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });

            const hashedPassword = await hashPassword(motDePasse);
            const finalRole = role ? role.toUpperCase().replace('-', '_') : 'LECTEUR';

            const newUser = await prisma.utilisateur.create({
                data: { nomComplet, email, motDePasse: hashedPassword, role: finalRole, actif: true },
                select: { id: true, nomComplet: true, email: true, role: true, actif: true, lastLogin: true, createdAt: true }
            });

            // AUDIT
            await logAdminAction(req, 'CREATE_USER', newUser.id, { nomComplet, email, role: finalRole });

            return res.status(201).json({ success: true, message: 'Utilisateur créé', data: newUser });
        } catch (error) { next(error); }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { nomComplet, role, actif } = req.body;

            const updatedUser = await prisma.utilisateur.update({
                where: { id },
                data: {
                    ...(nomComplet && { nomComplet }),
                    ...(role && { role: role.toUpperCase().replace('-', '_') }),
                    ...(actif !== undefined && { actif }),
                },
                select: { id: true, nomComplet: true, email: true, role: true, actif: true, lastLogin: true, createdAt: true }
            });

            // AUDIT
            await logAdminAction(req, 'UPDATE_USER', id, { updatedFields: Object.keys(req.body) });

            return res.status(200).json({ success: true, message: 'Utilisateur mis à jour', data: updatedUser });
        } catch (error) { next(error); }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            // Soft delete
            await prisma.utilisateur.update({
                where: { id },
                data: { actif: false, refreshToken: null }
            });

            // AUDIT
            await logAdminAction(req, 'SOFT_DELETE_USER', id, {});

            return res.status(200).json({ success: true, message: 'Utilisateur désactivé (Soft-Delete).' });
        } catch (error) { next(error); }
    }
}

module.exports = new UserController();
