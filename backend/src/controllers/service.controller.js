const serviceService = require('../services/service.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');
const fs = require('fs');

class ServiceController {
  async create(req, res, next) {
    try {
      const service = await serviceService.create(req.body, req.user.id);
      await logAction(req, req.user.id, 'CREATE_SERVICE', 'SERVICE', service.id);
      return res.status(201).json({
        success: true,
        message: 'Service créé avec succès.',
        data: service,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { actif } = req.query;
      const { data, total } = await serviceService.findAll({ page, limit, skip, actif });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const service = await serviceService.findOne(req.params.id);
      return res.json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const service = await serviceService.update(req.params.id, req.body, req.user.id);
      await logAction(req, req.user.id, 'UPDATE_SERVICE', 'SERVICE', service.id, req.body);
      return res.json({
        success: true,
        message: 'Service mis à jour.',
        data: service,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await serviceService.softDelete(req.params.id, req.user.id);
      await logAction(req, req.user.id, 'DELETE_SERVICE', 'SERVICE', req.params.id);
      return res.json({ success: true, message: 'Service désactivé.' });
    } catch (err) {
      next(err);
    }
  }

  async reorder(req, res, next) {
    try {
      await serviceService.reorder(req.body.ids, req.user.id);
      await logAction(req, req.user.id, 'REORDER_SERVICES', 'SERVICE', null, {
        count: req.body.ids.length,
      });
      return res.json({ success: true, message: 'Ordre des services mis à jour.' });
    } catch (err) {
      next(err);
    }
  }

  async replaceImage(req, res, next) {
    try {
      if (!req.file) throw new (require('../utils/appError'))('Aucun fichier reçu.', 400);
      const media = await serviceService.replaceImage(req.params.id, req.file, req.user.id);
      await logAction(req, req.user.id, 'REPLACE_IMAGE_SERVICE', 'SERVICE', req.params.id, { mediaId: media.id });
      return res.json({ success: true, message: 'Image du service mise à jour.', data: media });
    } catch (err) {
      if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch { /* ignore */ } }
      next(err);
    }
  }

  async findAllPublic(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { data, total } = await serviceService.findAllPublic({ skip, limit });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOnePublic(req, res, next) {
    try {
      const service = await serviceService.findOnePublic(req.params.slug);
      return res.json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ServiceController();
