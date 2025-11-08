const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Utiliser le transporter centralisé
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Demande de réinitialisation de mot de passe
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Pour des raisons de sécurité, on renvoie toujours un succès
      // même si l'email n'existe pas
      return res.json({ 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Sauvegarder le token et sa date d'expiration (1 heure)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // URL de réinitialisation
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Contenu de l'email
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 GoDriver</h1>
              <p>Réinitialisation de mot de passe</p>
            </div>
            <div class="content">
              <p>Bonjour ${user.firstName || 'Utilisateur'},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ce lien est valable pendant <strong>1 heure</strong>.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
              <p>Cordialement,<br>L'équipe GoDriver</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Envoyer l'email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email de réinitialisation envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // En développement, on peut continuer sans email
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Erreur lors de l\'envoi de l\'email' 
        });
      } else {
        console.log('🔗 Lien de réinitialisation (dev):', resetUrl);
      }
    }

    res.json({ 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      // En développement, on peut renvoyer le lien
      ...(process.env.NODE_ENV !== 'production' && { resetUrl })
    });

  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Réinitialisation du mot de passe
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Hasher le token pour le comparer
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Trouver l'utilisateur avec ce token et vérifier qu'il n'est pas expiré
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Token invalide ou expiré' 
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Supprimer le token de réinitialisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log(`✅ Mot de passe réinitialisé pour ${user.email}`);

    res.json({ 
      message: 'Mot de passe réinitialisé avec succès' 
    });

  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  forgotPassword,
  resetPassword
};
