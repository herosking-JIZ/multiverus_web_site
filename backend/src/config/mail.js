const nodemailer = require('nodemailer');

const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;

// Port 465 → SSL direct (secure: true)
// Port 587 → STARTTLS (secure: false, négociation TLS après connexion)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Rejette les certificats auto-signés en production
        rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
});

// Vérification de la connexion SMTP au démarrage (non-bloquant)
if (process.env.NODE_ENV !== 'test') {
    transporter.verify((error) => {
        if (error) {
            console.error('[MailConfig] Connexion SMTP échouée :', error.message);
        } else {
            console.log('[MailConfig] Connexion SMTP OK');
        }
    });
}

module.exports = transporter;
