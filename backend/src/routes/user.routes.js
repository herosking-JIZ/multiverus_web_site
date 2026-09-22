const express = require('express');
const { body, param, validationResult } = require('express-validator');
const userController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/role.middleware');

const router = express.Router();

// --------------------------------------------------
// VALIDATEURS (express-validator) : Sanitation SÉCURITÉ
// --------------------------------------------------
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Erreur de validation des données', errors: errors.array() });
    }
    next();
};

const createUserValidation = [
    body('email').trim().isEmail().withMessage("Format d'email invalide").normalizeEmail(),
    body('motDePasse').isLength({ min: 8 }).withMessage('Le mot de passe doit comporter au moins 8 caractères'),
    // escape() prévient les XSS en purifiant l'entrée utilisateur
    body('nomComplet').trim().notEmpty().withMessage('Nom complet obligatoire').escape(),
    body('role').optional().isIn(['ADMIN']).withMessage('Rôle invalide'),
    validateRequest
];

const updateUserValidation = [
    param('id').isUUID().withMessage("L'ID utilisateur doit être un UUID valide"),
    body('nomComplet').optional().trim().notEmpty().escape(),
    body('role').optional().isIn(['ADMIN']),
    body('actif').optional().isBoolean().withMessage('Le statut actif doit être un booléen'),
    validateRequest
];

const deleteUserValidation = [
    param('id').isUUID().withMessage("L'ID utilisateur doit être un UUID valide"),
    validateRequest
];

// --------------------------------------------------
// ROUTES (Exemples de Protection RBAC)
// --------------------------------------------------

/**
 * GET /users
 * EXEMPLE BONUS : Route paramétrée pour le rôle 'super-admin', 'editeur' et 'moderateur' (seulement eux peuvent lister)
 */


router.get('/',
    verifyToken,
    isAdmin,
    userController.getUsers
);
router.get('/me/:id',
    verifyToken,
    userController.getUserById
);


/**
 * POST /users
 * STRICT : Seulement les SUPER_ADMIN peuvent attribuer des droits et créer directement
 */
router.post('/',
    verifyToken,
    isAdmin,
    createUserValidation,
    userController.createUser
);

/**
 * PATCH /users/:id
 * STRICT : SuperAdmin seulement
 */
router.patch('/:id',
    verifyToken,
    isAdmin,
    updateUserValidation,
    userController.updateUser
);

/**
 * DELETE /users/:id
 * STRICT : SuperAdmin seulement (Soft Delete)
 */
router.delete('/:id',
    verifyToken,
    isAdmin,
    deleteUserValidation,
    userController.deleteUser
);

module.exports = router;
