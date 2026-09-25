const transporter = require('../config/mail');

class MailService {
    async sendPasswordResetEmail(email, token) {
        // En vrai, on utiliserait le domaine du frontend depuis process.env
        const frontendUrl = process.env.FRONTEND_URL;
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        console.log('resetLink', resetLink);
        const htmlTemplate = `
    <!DOCTYPE html>
        <html lang="fr">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
        :root {
          --primary-blue:#004AAD;
          --light-bg:#F5F9FF;
          --card-bg:rgba(255,255,255,0.85);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: var(--light-bg); font-family: 'Inter', sans-serif; }
        .wrapper { padding: 40px 20px; }
        .email-card { max-width: 600px; margin: 0 auto; background: var(--card-bg); border: 1px solid #E0E0E0; border-radius: 12px; backdrop-filter: blur(8px); overflow: hidden; }
        .header { background: var(--primary-blue); padding: 28px 40px; display: flex; align-items: center; justify-content: space-between; color: #fff; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 32px; height: 32px; background: var(--primary-blue); display: flex; align-items: center; justify-content: center; }
        .logo-name { color: #fff; font-size: 16px; letter-spacing: 0.08em; }
        .header-tag { color: #D0E1FF; font-size: 11px; font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
        .body { padding: 40px 40px 0; }
        .title-block { border-left: 2px solid var(--primary-blue); padding-left: 16px; margin-bottom: 28px; }
        .eyebrow { font-size: 11px; font-family: 'Courier New', monospace; color: #999; letter-spacing: 0.1em; margin-bottom: 6px; }
        h1 { font-size: 22px; font-weight: normal; color: #1A1A1A; letter-spacing: 0.02em; }
        p { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 16px; }
        .cta-wrapper { text-align: center; margin: 32px 0; }
        .cta-btn { display: inline-block; padding: 14px 36px; background: var(--primary-blue); color: #fff !important; text-decoration: none; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 0.12em; border: none; border-radius: 6px; transition: background .3s; }
        .cta-btn:hover { background: #003377; }
        .link-box { background: #E8F0FF; border: 1px solid #C0D8FF; padding: 14px 18px; margin-bottom: 28px; }
        .link-label { font-size: 11px; font-family: 'Courier New', monospace; color: #999; letter-spacing: 0.08em; margin-bottom: 4px; }
        .link-url { font-size: 12px; color: var(--primary-blue); font-family: 'Courier New', monospace; word-break: break-all; }
        .notice { border-top: 1px solid #E8E4DA; padding: 24px 40px; display: flex; gap: 12px; align-items: flex-start; }
        .notice p { font-size: 12px; color: #999; margin: 0; }
        .footer { background: var(--primary-blue); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
        .footer span { font-size: 11px; font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
        @media (max-width: 480px) {
          .wrapper { padding: 20px 10px; }
          .header, .footer { padding: 20px; }
          .cta-btn { width: 100%; display: block; text-align: center; }
        }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="email-card">
                <div class="header">
                <div class="logo">
                    <div class="logo-icon">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 13L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="#0D0D0D"/>
                        </svg>
                    </div>
                    <span class="logo-name">MULTIVERUS</span>
                </div>  
                <span class="header-tag">SÉCURITÉ DU COMPTE</span>
            </div>

    <div class="body">
      <div class="title-block">
        <p class="eyebrow">RÉINITIALISATION DU MOT DE PASSE</p>
        <h1>Accès à votre compte</h1>
      </div>

      <p>Bonjour,</p>
      <p>Vous avez effectué une demande de réinitialisation du mot de passe associé à votre compte MultiVerus.</p>
      <p>Ce lien sécurisé est valide pendant <strong>15 minutes</strong>. Passé ce délai, vous devrez effectuer une nouvelle demande.</p>

      <div class="cta-wrapper">
        <a href="${resetLink}" class="cta-btn">RÉINITIALISER MON MOT DE PASSE →</a>
      </div>

      <div class="link-box">
        <p class="link-label">LIEN ALTERNATIF</p>
        <p class="link-url">${resetLink}</p>
      </div>
    </div>

    <div class="notice">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:1px">
        <circle cx="10" cy="10" r="9" stroke="#999" stroke-width="1"/>
        <path d="M10 9v5M10 7v1" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe demeure inchangé et votre compte reste sécurisé.</p>
    </div>

    <div class="footer">
      <span>© ${new Date().getFullYear()} MULTIVERUS</span>
      <span>CONFIDENTIEL</span>
    </div>

  </div>
</div>
</body>
</html>
`;
        // SMTP_FROM doit être au format : "Nom Affiché <adresse@domaine.com>"
        // Avec Gmail, l'adresse DOIT correspondre au SMTP_USER authentifié.
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Sécurité du compte : Réinitialisation de votre mot de passe',
            html: htmlTemplate
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("[MailService] Erreur lors de l'envoi de l'email de reset:", error);
            // On catch silencieusement pour ne pas révéler à l'utilisateur de l'API s'il y a un défaut mail,
            // ou bien on pourrait throw si c'était impératif. Mais pour la neutralité, on gère l'erreur.
            return false;
        }
    }
}

module.exports = new MailService();
