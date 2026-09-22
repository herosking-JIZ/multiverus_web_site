const express = require('express');

// Modules existants
const authRoutes = require('./auth.routes');
const passwordRoutes = require('./password.routes');
const userRoutes = require('./user.routes');

// Nouveaux modules métier
const serviceRoutes = require('./service.routes');
const produitRoutes = require('./produit.routes');
const referenceRoutes = require('./reference.routes');
const partenaireRoutes = require('./partenaire.routes');
const leadRoutes = require('./lead.routes');
const mediaRoutes = require('./media.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// ===================================================================
// MODULES EXISTANTS
// ===================================================================
router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/users', userRoutes);

// ===================================================================
// MODULES MÉTIER
// Routes montées à la racine (les chemins /admin/* et publics
// sont définis directement dans chaque fichier de routes)
// ===================================================================
router.use('/', serviceRoutes);
router.use('/', produitRoutes);
router.use('/', referenceRoutes);
router.use('/', partenaireRoutes);
router.use('/', leadRoutes);
router.use('/', mediaRoutes);
router.use('/', analyticsRoutes);

module.exports = router;
