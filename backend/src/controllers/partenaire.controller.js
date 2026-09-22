const partenaireService = require('../services/partenaire.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');
const fs = require('fs');

class PartenaireController {
  async create(req, res, next) {
    try {
      const partenaire = await partenaireService.create(req.body, req.user.id);
      await logAction(req, req.user.id, 'CREATE_PARTENAIRE', 'PARTENAIRE', partenaire.id);
      return res.status(201).json({
        success: true,
        message: 'Partenaire créé avec succès.',
        data: partenaire,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { actif } = req.query;
      const { data, total } = await partenaireService.findAll({ page, limit, skip, actif });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const partenaire = await partenaireService.findOne(req.params.id);
      return res.json({ success: true, data: partenaire });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const partenaire = await partenaireService.update(req.params.id, req.body, req.user.id);
      await logAction(req, req.user.id, 'UPDATE_PARTENAIRE', 'PARTENAIRE', partenaire.id, req.body);
      return res.json({
        success: true,
        message: 'Partenaire mis à jour.',
        data: partenaire,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await partenaireService.softDelete(req.params.id, req.user.id);
      await logAction(req, req.user.id, 'DELETE_PARTENAIRE', 'PARTENAIRE', req.params.id);
      return res.json({ success: true, message: 'Partenaire désactivé.' });
    } catch (err) {
      next(err);
    }
  }

  async reorder(req, res, next) {
    try {
      await partenaireService.reorder(req.body.ids, req.user.id);
      await logAction(req, req.user.id, 'REORDER_PARTENAIRES', 'PARTENAIRE', null, {
        count: req.body.ids.length,
      });
      return res.json({ success: true, message: 'Ordre des partenaires mis à jour.' });
    } catch (err) {
      next(err);
    }
  }

  async replaceLogo(req, res, next) {
    try {
      if (!req.file) throw new (require('../utils/appError'))('Aucun fichier reçu.', 400);
      const media = await partenaireService.replaceLogo(req.params.id, req.file, req.user.id);
      await logAction(req, req.user.id, 'REPLACE_LOGO_PARTENAIRE', 'PARTENAIRE', req.params.id, { mediaId: media.id });
      return res.json({ success: true, message: 'Logo du partenaire mis à jour.', data: media });
    } catch (err) {
      if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch { /* ignore */ } }
      next(err);
    }
  }

  async findAllPublic(req, res, next) {
    try {
      const data = await partenaireService.findAllPublic();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PartenaireController();
