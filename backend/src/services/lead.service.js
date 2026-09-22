const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const transporter = require('../config/mail');

class LeadService {
  /**
   * Crée un lead depuis le formulaire public + envoie un email de notification.
   */
  async createFromContact(data, ipAdresse) {
    const lead = await prisma.lead.create({
      data: { ...data, ipAdresse, statut: 'NOUVEAU' },
    });

    // Notification email (non bloquant)
    setImmediate(() => {
      transporter.sendMail({
        from: `"Broadway Technologies" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `[Nouveau lead] ${lead.sujet}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Nom</td><td style="padding:8px">${lead.nomComplet}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${lead.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Organisation</td><td style="padding:8px">${lead.organisation || '-'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Sujet</td><td style="padding:8px">${lead.sujet}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${lead.message}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Date</td><td style="padding:8px">${lead.createdAt.toLocaleString('fr-FR')}</td></tr>
          </table>
          <p style="margin-top:16px">
            <a href="${process.env.FRONTEND_URL || ''}/admin/leads/${lead.id}">
              Voir dans l'administration
            </a>
          </p>
        `,
      }).catch((err) => console.error('[Lead] Erreur email notification :', err.message));
    });

    return lead;
  }

  async findAll({ page, limit, skip, statut, from, to }) {
    const where = {};
    if (statut) where.statut = statut;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          nomComplet: true,
          email: true,
          organisation: true,
          sujet: true,
          statut: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new AppError('Lead introuvable.', 404);
    return lead;
  }

  async updateStatut(id, statut, userId) {
    await this.findOne(id);

    return prisma.lead.update({
      where: { id },
      data: { statut, traitePar: userId },
    });
  }

  async addNote(id, notes) {
    await this.findOne(id);

    return prisma.lead.update({
      where: { id },
      data: { notesInternes: notes },
    });
  }

  async delete(id) {
    await this.findOne(id);
    return prisma.lead.delete({ where: { id } });
  }

  /**
   * Exporte tous les leads (filtrés) sous forme de tableau de données brutes.
   * La génération CSV est dans le contrôleur.
   */
  async findAllForExport({ statut, from, to }) {
    const where = {};
    if (statut) where.statut = statut;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new LeadService();
