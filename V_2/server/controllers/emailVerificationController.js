const User = require('../models/User');

// Configuration de l'envoi d'email (lazy loading)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

// Générer un code de vérification à 6 chiffres
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envoyer le code de vérification par email
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà vérifié
    if (user.isEmailVerified) {
      return res.json({ 
        message: 'Email déjà vérifié',
        alreadyVerified: true 
      });
    }

    // Générer un code de vérification
    const verificationCode = generateVerificationCode();

    // Sauvegarder le code et sa date d'expiration (10 minutes)
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@godriver.com',
      to: user.email,
      subject: 'Code de vérification - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 GoDriver</h1>
              <p>Vérification de votre email</p>
            </div>
            <div class="content">
              <p>Bonjour ${user.firstName || 'Utilisateur'},</p>
              <p>Voici votre code de vérification pour confirmer votre adresse email :</p>
              <div class="code">${verificationCode}</div>
              <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
              <p>Si vous n'avez pas demandé cette vérification, ignorez simplement cet email.</p>
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
      const emailTransporter = getTransporter();
      await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Code de vérification envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // En développement, on peut continuer sans email
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Erreur lors de l\'envoi de l\'email' 
        });
      } else {
        console.log('🔢 Code de vérification (dev):', verificationCode);
      }
    }

    res.json({ 
      message: 'Code de vérification envoyé',
      // En développement, on peut renvoyer le code
      ...(process.env.NODE_ENV !== 'production' && { code: verificationCode })
    });

  } catch (error) {
    console.error('Erreur sendVerificationCode:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Vérifier le code de vérification
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    // Trouver l'utilisateur avec ce code et vérifier qu'il n'est pas expiré
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Code invalide ou expiré' 
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Email vérifié pour ${user.email}`);

    res.json({ 
      message: 'Email vérifié avec succès',
      isEmailVerified: true
    });

  } catch (error) {
    console.error('Erreur verifyCode:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Renvoyer le code de vérification
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà vérifié
    if (user.isEmailVerified) {
      return res.json({ 
        message: 'Email déjà vérifié',
        alreadyVerified: true 
      });
    }

    // Vérifier si un code a été envoyé récemment (moins de 1 minute)
    if (user.emailVerificationExpires && user.emailVerificationExpires > Date.now() + 540000) {
      return res.status(429).json({ 
        error: 'Veuillez attendre avant de demander un nouveau code',
        retryAfter: Math.ceil((user.emailVerificationExpires - Date.now() - 540000) / 1000)
      });
    }

    // Générer un nouveau code
    const verificationCode = generateVerificationCode();

    // Sauvegarder le code et sa date d'expiration (10 minutes)
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@godriver.com',
      to: user.email,
      subject: 'Nouveau code de vérification - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 GoDriver</h1>
              <p>Nouveau code de vérification</p>
            </div>
            <div class="content">
              <p>Bonjour ${user.firstName || 'Utilisateur'},</p>
              <p>Voici votre nouveau code de vérification :</p>
              <div class="code">${verificationCode}</div>
              <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
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
      const emailTransporter = getTransporter();
      await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Nouveau code de vérification envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Erreur lors de l\'envoi de l\'email' 
        });
      } else {
        console.log('🔢 Nouveau code de vérification (dev):', verificationCode);
      }
    }

    res.json({ 
      message: 'Nouveau code de vérification envoyé',
      ...(process.env.NODE_ENV !== 'production' && { code: verificationCode })
    });

  } catch (error) {
    console.error('Erreur resendVerificationCode:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  resendVerificationCode
};
