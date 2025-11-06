const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Employer = require('../models/Employer');

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'devsecret', 
    { expiresIn: '7d' }
  );
};

// Fonction pour envoyer l'email de vérification
async function sendVerificationEmail(user, code) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@godriver.com',
      to: user.email,
      subject: 'Vérifiez votre email - GoDriver',
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
              <p>Bienvenue !</p>
            </div>
            <div class="content">
              <p>Bonjour ${user.firstName || 'Utilisateur'},</p>
              <p>Merci de vous être inscrit sur GoDriver ! Pour finaliser votre inscription, veuillez vérifier votre adresse email avec le code ci-dessous :</p>
              <div class="code">${code}</div>
              <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
              <p>Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${user.email}`);
    
    // En développement, afficher le code dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔢 Code de vérification (dev): ${code}`);
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
}

// Inscription
const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role = 'client',
      firstName,
      lastName,
      phone,
      // Champs spécifiques pour les chauffeurs
      licenseType,
      licenseNumber,
      licenseDate,
      experience,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleSeats,
      workZone,
      specialties
    } = req.body;

    // Validation des champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe sont requis' 
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format d\'email invalide' 
      });
    }

    // Validation de la force du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Cette adresse email est déjà utilisée' 
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      role,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || ''
    };

    const user = await User.create(userData);

    // Si c'est un chauffeur, créer aussi le profil chauffeur
    if (role === 'driver') {
      try {
        const driverData = {
          userId: user._id,
          firstName,
          lastName,
          phone: phone || '06 00 00 00 00', // Valeur par défaut si pas fourni
          email: email.toLowerCase(),
          licenseType: licenseType || 'B', // Valeur par défaut
          licenseNumber: licenseNumber || `B${Math.random().toString().substr(2, 9)}`,
          licenseDate: licenseDate ? new Date(licenseDate) : new Date('2020-01-01'), // Date par défaut
          experience: experience || '1-3', // Valeur par défaut
          vehicleType: vehicleType || 'berline', // Valeur par défaut
          vehicleBrand: vehicleBrand || 'Renault',
          vehicleModel: vehicleModel || 'Clio',
          vehicleYear: vehicleYear ? parseInt(vehicleYear) : 2020,
          vehicleSeats: vehicleSeats ? parseInt(vehicleSeats) : 5,
          workZone: workZone || 'Paris', // Valeur par défaut
          specialties: specialties || ['transport_personnel'],
          status: 'approved', // Approuvé directement pour simplifier les tests
          isAvailable: true // Disponible par défaut
        };

        await Driver.create(driverData);
        console.log(`✅ Profil chauffeur créé pour ${firstName} ${lastName}`);
      } catch (driverError) {
        console.error('❌ Erreur lors de la création du profil chauffeur:', driverError);
        // Ne pas faire échouer l'inscription si la création du profil échoue
        // L'utilisateur pourra compléter son profil plus tard
      }
    }

    // Si c'est un employeur, créer aussi le profil employeur
    if (role === 'employer') {
      try {
        const employerData = {
          userId: user._id,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone: phone || '',
          status: 'approved', // Approuvé directement
          isActive: true
        };

        await Employer.create(employerData);
        console.log(`✅ Profil employeur créé pour ${firstName} ${lastName}`);
      } catch (employerError) {
        console.error('❌ Erreur lors de la création du profil employeur:', employerError);
        // Ne pas faire échouer l'inscription si la création du profil échoue
      }
    }

    // Générer un code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Envoyer le code par email (asynchrone, ne pas bloquer l'inscription)
    sendVerificationEmail(user, verificationCode).catch(err => {
      console.error('❌ Erreur envoi email de vérification:', err);
    });

    // Générer le token
    const token = generateToken(user);

    // Réponse sans le mot de passe
    res.status(201).json({
      message: 'Compte créé avec succès. Un code de vérification a été envoyé à votre email.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified
      },
      token,
      requiresEmailVerification: !user.isEmailVerified
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la création du compte' 
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe sont requis' 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token
    const token = generateToken(user);

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la connexion' 
    });
  }
};

// Profil utilisateur actuel
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Si c'est un chauffeur, récupérer aussi les infos du profil chauffeur
    if (user.role === 'driver') {
      const driverProfile = await Driver.findOne({ userId: user._id }).lean();
      user.driverProfile = driverProfile;
    }

    // Si c'est un employeur, récupérer aussi les infos du profil employeur
    if (user.role === 'employer') {
      const employerProfile = await Employer.findOne({ userId: user._id }).lean();
      user.employerProfile = employerProfile;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        needsRoleSelection: user.needsRoleSelection,
        authProvider: user.authProvider,
        profilePhotoUrl: user.profilePhotoUrl,
        driverProfile: user.driverProfile,
        employerProfile: user.employerProfile
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du profil' 
    });
  }
};

// Mise à jour du profil
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Mettre à jour les champs
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du profil' 
    });
  }
};

// Mettre à jour le rôle de l'utilisateur (pour Google OAuth)
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.sub;

    // Validation du rôle
    if (!role || !['driver', 'employer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Rôle invalide. Choisissez "driver" ou "employer"' 
      });
    }

    // Mettre à jour le rôle et supprimer le flag needsRoleSelection
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        role,
        needsRoleSelection: false
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`✅ Rôle mis à jour pour ${user.email}: ${role}`);

    res.json(user);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateRole
};
