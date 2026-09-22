const produitService = require('../services/produit.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');
const fs = require('fs');

class ProduitController {
  async create(req, res, next) {
    try {
      const produit = await produitService.create(req.body, req.user.id);
      await logAction(req, req.user.id, 'CREATE_PRODUIT', 'PRODUIT', produit.id);
      return res.status(201).json({
        success: true,
        message: 'Produit créé avec succès.',
        data: produit,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { categorie, statut, actif } = req.query;
      const { data, total } = await produitService.findAll({
        page, limit, skip, categorie, statut, actif,
      });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const produit = await produitService.findOne(req.params.id);
      return res.json({ success: true, data: produit });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const produit = await produitService.update(req.params.id, req.body, req.user.id);
      await logAction(req, req.user.id, 'UPDATE_PRODUIT', 'PRODUIT', produit.id, req.body);
      return res.json({
        success: true,
        message: 'Produit mis à jour.',
        data: produit,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await produitService.softDelete(req.params.id, req.user.id);
      await logAction(req, req.user.id, 'DELETE_PRODUIT', 'PRODUIT', req.params.id);
      return res.json({ success: true, message: 'Produit archivé.' });
    } catch (err) {
      next(err);
    }
  }

  async replaceImage(req, res, next) {
    try {
      if (!req.file) throw new (require('../utils/appError'))('Aucun fichier reçu.', 400);
      const media = await produitService.replaceImage(req.params.id, req.file, req.user.id);
      await logAction(req, req.user.id, 'REPLACE_IMAGE_PRODUIT', 'PRODUIT', req.params.id, { mediaId: media.id });
      return res.json({ success: true, message: 'Image du produit mise à jour.', data: media });
    } catch (err) {
      if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch { /* ignore */ } }
      next(err);
    }
  }

  async findAllPublic(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { categorie } = req.query;
      const { data, total } = await produitService.findAllPublic({ skip, limit, categorie });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOnePublic(req, res, next) {
    try {
      const produit = await produitService.findOnePublic(req.params.slug);
      return res.json({ success: true, data: produit });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProduitController();
