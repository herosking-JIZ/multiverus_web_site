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

    // En environnement Serverless (Vercel), l'envoi de mail DOIT être attendu (await)
    // sinon Vercel gèle le conteneur dès que la réponse HTTP est envoyée et l'email n'est jamais transmis.
    const adminBaseUrl = (process.env.ADMIN_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const leadLink = `${adminBaseUrl}/leads`;

    // Supporte une liste d'emails séparés par des virgules (ex: "admin1@domaine.com, admin2@domaine.com")
    const rawReceivers = process.env.CONTACT_RECEIVER_EMAILS || process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const recipientList = rawReceivers
      ? rawReceivers.split(',').map((email) => email.trim()).filter(Boolean)
      : (process.env.SMTP_USER ? [process.env.SMTP_USER] : []);

    if (process.env.SMTP_USER && process.env.SMTP_PASS && recipientList.length > 0) {
      try {
        console.log(`[Lead] Envoi de l'email de notification vers : ${recipientList.join(', ')}...`);
        const fromAddress = process.env.SMTP_FROM && process.env.SMTP_FROM.includes('@')
          ? process.env.SMTP_FROM
          : `"MultiVerus" <${process.env.SMTP_USER}>`;

        // 1. Notification pour l'administrateur / équipe (envoyée à l'ensemble des destinataires)
        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipientList.join(', '),
          replyTo: lead.email,
          subject: `[Nouveau lead - Discutons] ${lead.sujet} (${lead.nomComplet})`,
          html: `
            <h2>Nouveau message de contact (Discutons)</h2>
            <table style="border-collapse:collapse;width:100%;font-family:sans-serif">
              <tr><td style="padding:8px;font-weight:bold;width:140px;background:#f5f5f5">Nom complet</td><td style="padding:8px">${lead.nomComplet}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Organisation</td><td style="padding:8px">${lead.organisation || '-'}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Sujet</td><td style="padding:8px">${lead.sujet}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Message</td><td style="padding:8px;white-space:pre-wrap">${lead.message}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Date</td><td style="padding:8px">${lead.createdAt.toLocaleString('fr-FR')}</td></tr>
            </table>
            <p style="margin-top:20px">
              <a href="${leadLink}" style="display:inline-block;padding:12px 20px;background:#004AAD;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold">
                Consulter ce lead dans l'administration
              </a>
            </p>
          `,
        });
        console.log(`✅ [Lead] Notification admin envoyée avec succès ! MessageId: ${info.messageId}`);

        // 2. Accusé de réception pour le client
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: lead.email,
            subject: 'Nous avons bien reçu votre demande - MultiVerus',
            html: `
              <p>Bonjour ${lead.nomComplet},</p>
              <p>Nous vous remercions d'avoir contacté MultiVerus. Nous avons bien reçu votre demande concernant <strong>${lead.sujet}</strong>.</p>
              <p>Notre équipe examine votre message et vous répondra dans les plus brefs délais.</p>
              <br>
              <p>Cordialement,</p>
              <p><strong>L'équipe MultiVerus</strong></p>
            `,
          });
          console.log(`✅ [Lead] Accusé de réception envoyé au client (${lead.email})`);
        } catch (clientErr) {
          console.warn('[Lead] Accusé de réception client non envoyé :', clientErr.message);
        }
      } catch (err) {
        console.error('❌ [Lead] Erreur lors de l\'envoi de l\'email de notification :', err.message);
      }
    } else {
      console.warn('⚠️ [Lead] Variables SMTP_USER ou SMTP_PASS manquantes dans l\'environnement. Aucun email envoyé.');
    }

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
