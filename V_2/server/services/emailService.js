const nodemailer = require('nodemailer');

// Vérifier si les credentials email sont configurés
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Configuration du transporteur email (seulement si configuré)
let transporter = null;

if (isEmailConfigured) {
  const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: emailPort,
    secure: emailPort === 465, // true pour 465, false pour 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    connectionTimeout: 10000, // 10 secondes
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  // Vérifier la connexion au serveur email (async, ne bloque pas le démarrage)
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️ Email non disponible:', error.message);
      console.warn('⚠️ Les emails ne seront pas envoyés tant que la configuration n\'est pas correcte');
    } else {
      console.log('✅ Serveur email prêt à envoyer des messages');
    }
  });
} else {
  console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD non configuré');
  console.warn('⚠️ Les fonctionnalités email sont désactivées');
}

// Fonction helper pour vérifier si l'email est disponible
const isEmailAvailable = () => {
  return transporter !== null;
};

/**
 * Envoyer un email de validation de compte chauffeur
 */
const sendDriverValidationEmail = async (driver) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - validation email non envoyé à', driver.email);
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: driver.email,
      subject: '✅ Votre compte chauffeur a été validé - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Félicitations !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${driver.firstName} ${driver.lastName},</h2>
              <p>Nous avons le plaisir de vous informer que votre compte chauffeur a été <strong>validé avec succès</strong> !</p>
              
              <p>Vous pouvez maintenant :</p>
              <ul>
                <li>✅ Postuler aux offres d'emploi</li>
                <li>✅ Être visible dans la recherche de chauffeurs</li>
                <li>✅ Recevoir des propositions d'employeurs</li>
                <li>✅ Accéder à toutes les fonctionnalités de la plateforme</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/offres" class="button">
                  Voir les offres disponibles
                </a>
              </div>

              <p>Merci de faire confiance à GoDriver pour votre carrière professionnelle.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe GoDriver</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de validation envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de validation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de rejet de compte chauffeur
 */
const sendDriverRejectionEmail = async (driver, reason) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - rejection email non envoyé à', driver.email);
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: driver.email,
      subject: 'Mise à jour de votre candidature - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .reason-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Mise à jour de votre candidature</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${driver.firstName} ${driver.lastName},</h2>
              <p>Nous vous remercions pour votre inscription sur GoDriver.</p>
              
              <p>Après examen de votre dossier, nous ne pouvons malheureusement pas valider votre compte pour le moment.</p>
              
              ${reason ? `
                <div class="reason-box">
                  <strong>Raison :</strong><br>
                  ${reason}
                </div>
              ` : ''}

              <p><strong>Que faire maintenant ?</strong></p>
              <ul>
                <li>Vérifiez que tous vos documents sont valides et lisibles</li>
                <li>Assurez-vous que vos informations sont complètes et exactes</li>
                <li>Vous pouvez mettre à jour votre profil et soumettre à nouveau votre candidature</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/mon-profil" class="button">
                  Mettre à jour mon profil
                </a>
              </div>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe GoDriver</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de rejet envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de rejet:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de bienvenue
 */
const sendWelcomeEmail = async (user) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - welcome email non envoyé à', user.email);
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Bienvenue sur GoDriver ! 🚗',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur <span style="color: #F97316;">Go</span>Driver !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.firstName} ${user.lastName},</h2>
              <p>Merci de vous être inscrit sur <strong>GoDriver</strong>, la plateforme qui connecte chauffeurs et employeurs en Côte d'Ivoire.</p>
              
              ${user.role === 'driver' ? `
                <p><strong>En tant que chauffeur, vous pouvez :</strong></p>
                <ul>
                  <li>🔍 Rechercher des offres d'emploi</li>
                  <li>📝 Postuler aux offres qui vous intéressent</li>
                  <li>💼 Gérer vos candidatures</li>
                  <li>👤 Compléter votre profil pour être visible</li>
                </ul>
                <p><strong>Prochaine étape :</strong> Complétez votre profil et soumettez vos documents pour validation.</p>
              ` : `
                <p><strong>En tant qu'employeur, vous pouvez :</strong></p>
                <ul>
                  <li>📢 Publier des offres d'emploi</li>
                  <li>🔍 Rechercher des chauffeurs qualifiés</li>
                  <li>📋 Gérer les candidatures reçues</li>
                  <li>💬 Contacter directement les chauffeurs</li>
                </ul>
                <p><strong>Prochaine étape :</strong> Publiez votre première offre d'emploi !</p>
              `}

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="button">
                  Accéder à mon compte
                </a>
              </div>

              <p>Si vous avez des questions, notre équipe est là pour vous aider.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe GoDriver</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenue envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de notification de nouvelle candidature à l'employeur
 */
const sendNewApplicationEmail = async (employer, offer, driver) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - application email non envoyé à', employer.email);
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: employer.email,
      subject: `Nouvelle candidature pour "${offer.title}" - GoDriver`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 6px; }
            .button { display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Nouvelle candidature reçue !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${employer.firstName} ${employer.lastName},</h2>
              <p>Vous avez reçu une nouvelle candidature pour votre offre d'emploi.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📋 Offre concernée</h3>
                <p><strong>${offer.title}</strong></p>
                <p>${offer.location?.city || 'Non spécifié'} • ${offer.salary ? offer.salary.toLocaleString() + ' FCFA/mois' : 'Salaire non spécifié'}</p>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">👤 Candidat</h3>
                <p><strong>${driver.firstName} ${driver.lastName}</strong></p>
                <p>📧 ${driver.email}</p>
                ${driver.phone ? `<p>📱 ${driver.phone}</p>` : ''}
                ${driver.experience ? `<p>💼 ${driver.experience} ans d'expérience</p>` : ''}
              </div>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/mes-candidatures" class="button">
                  Voir la candidature
                </a>
              </div>

              <p>Connectez-vous à votre espace pour consulter le profil complet du candidat et gérer cette candidature.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe GoDriver</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de nouvelle candidature envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de nouvelle candidature:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email avec le code de vérification lors de l'inscription
 */
const sendVerificationEmail = async (user, code) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - verification email non envoyé à', user.email);
    // En développement, afficher le code quand même
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔢 Code de vérification (email désactivé): ${code}`);
    }
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    console.log(`📬 SERVICE EMAIL - Préparation email pour: ${user.email}`);
    console.log(`📬 Objet user reçu:`, { email: user.email, firstName: user.firstName, _id: user._id });
    
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Vérifiez votre email - GoDriver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f97316; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; border: 2px dashed #f97316; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span style="color: #F97316;">Go</span>Driver</h1>
              <p>Bienvenue sur la plateforme !</p>
            </div>
            <div class="content">
              <h2>Bonjour ${user.firstName || 'Utilisateur'},</h2>
              <p>Merci de vous être inscrit sur <strong>GoDriver</strong> ! Pour finaliser votre inscription, veuillez vérifier votre adresse email avec le code ci-dessous :</p>
              
              <div class="code">${code}</div>
              
              <div class="warning">
                <strong>⏱️ Important :</strong> Ce code est valable pendant <strong>10 minutes</strong>.
              </div>

              <p><strong>Comment utiliser ce code ?</strong></p>
              <ol>
                <li>Retournez sur la page d'inscription</li>
                <li>Entrez ce code dans le champ prévu</li>
                <li>Cliquez sur "Vérifier"</li>
              </ol>

              <p>Si vous n'avez pas créé de compte sur GoDriver, ignorez simplement cet email.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe GoDriver</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log(`📤 ENVOI EMAIL - Destinataire: ${user.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${user.email}`);
    
    // En développement, afficher le code dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔢 Code de vérification (dev): ${code}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de notification de nouveau signalement aux admins
 */
const sendNewReportEmail = async (adminEmail, report, reporter) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - report email non envoyé à', adminEmail);
    return { success: false, error: 'Email service not configured' };
  }
  
  const reasonLabels = {
    spam: 'Spam ou publicité',
    inappropriate: 'Contenu inapproprié',
    fraud: 'Fraude ou arnaque',
    misleading: 'Information trompeuse',
    harassment: 'Harcèlement',
    other: 'Autre raison'
  };

  const targetLabels = {
    offer: 'Offre d\'emploi',
    product: 'Offre marketing',
    driver: 'Profil chauffeur',
    employer: 'Profil employeur'
  };

  try {
    const mailOptions = {
      from: `"GoDriver Admin" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `⚠️ Nouveau signalement - ${targetLabels[report.targetType] || report.targetType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 6px; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Nouveau signalement</h1>
            </div>
            <div class="content">
              <p>Un nouveau signalement a été soumis sur la plateforme et nécessite votre attention.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📋 Détails du signalement</h3>
                <p><strong>Type de contenu :</strong> ${targetLabels[report.targetType] || report.targetType}</p>
                <p><strong>Raison :</strong> ${reasonLabels[report.reason] || report.reason}</p>
                ${report.description ? `<p><strong>Description :</strong> ${report.description}</p>` : ''}
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">👤 Signalé par</h3>
                <p><strong>${reporter.firstName} ${reporter.lastName}</strong></p>
                <p>📧 ${reporter.email}</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/reports" class="button">
                  Traiter le signalement
                </a>
              </div>

              <p>Connectez-vous à l'interface d'administration pour traiter ce signalement.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par le système GoDriver.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver - Administration</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de signalement envoyé aux admins:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de signalement:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email au signaleur quand son signalement est traité
 */
const sendReportResolvedEmail = async (userEmail, userName, report, status, actionTaken) => {
  if (!isEmailAvailable()) {
    console.warn('⚠️ Email non configuré - resolved email non envoyé à', userEmail);
    return { success: false, error: 'Email service not configured' };
  }
  
  const statusLabels = {
    resolved: 'traité et résolu',
    dismissed: 'examiné et classé sans suite'
  };

  const targetLabels = {
    offer: 'l\'offre d\'emploi',
    product: 'l\'offre marketing',
    driver: 'le profil chauffeur',
    employer: 'le profil employeur'
  };

  const actionLabels = {
    none: 'Aucune action spécifique n\'a été prise.',
    warn: 'Un avertissement a été envoyé au propriétaire du contenu.',
    disable: 'Le contenu a été suspendu.',
    delete: 'Le contenu a été supprimé de la plateforme.'
  };

  try {
    const mailOptions = {
      from: `"GoDriver" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Votre signalement a été ${statusLabels[status] || 'traité'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${status === 'resolved' ? '#16a34a' : '#6b7280'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 6px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'resolved' ? '✅' : 'ℹ️'} Signalement traité</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              
              <p>Nous vous informons que votre signalement concernant <strong>${targetLabels[report.targetType] || 'le contenu'}</strong> a été <strong>${statusLabels[status] || 'traité'}</strong> par notre équipe de modération.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📋 Résumé</h3>
                <p><strong>Statut :</strong> ${status === 'resolved' ? 'Résolu' : 'Classé sans suite'}</p>
                ${actionTaken && actionTaken !== 'none' ? `<p><strong>Action prise :</strong> ${actionLabels[actionTaken]}</p>` : ''}
              </div>

              <p>Nous vous remercions d'avoir contribué à maintenir la qualité et la sécurité de notre plateforme. Votre vigilance nous aide à offrir une meilleure expérience à tous nos utilisateurs.</p>

              <p>Si vous avez d'autres préoccupations, n'hésitez pas à nous contacter.</p>

              <p>Cordialement,<br>L'équipe GoDriver</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par GoDriver.</p>
              <p>&copy; ${new Date().getFullYear()} GoDriver</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de résolution envoyé au signaleur:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de résolution:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendDriverValidationEmail,
  sendDriverRejectionEmail,
  sendWelcomeEmail,
  sendNewApplicationEmail,
  sendVerificationEmail,
  sendNewReportEmail,
  sendReportResolvedEmail,
  isEmailAvailable
};
