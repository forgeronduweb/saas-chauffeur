const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Employer = require('../models/Employer');
const ActivityLog = require('../models/ActivityLog');
const { sendVerificationEmail } = require('../services/emailService');

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
          experience: experience || '<1', // Valeur par défaut
          vehicleType: vehicleType || 'berline', // Valeur par défaut
          vehicleBrand: vehicleBrand || 'Renault',
          vehicleModel: vehicleModel || 'Clio',
          vehicleYear: vehicleYear ? parseInt(vehicleYear) : 2020,
          vehicleSeats: vehicleSeats ? parseInt(vehicleSeats) : 5,
          workZone: workZone || '', // Pas de valeur par défaut - à renseigner par l'utilisateur
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

    console.log(`📧 INSCRIPTION - Envoi email de vérification à: ${user.email}`);
    console.log(`🔢 Code généré: ${verificationCode}`);

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

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Veuillez vérifier votre email avant de vous connecter',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    // Générer le token
    const token = generateToken(user);

    // Mettre à jour la dernière connexion et les stats de session
    user.lastLogin = new Date();
    user.currentSessionStart = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastIpAddress = req.ip || req.connection?.remoteAddress;
    user.lastUserAgent = req.headers['user-agent'];
    await user.save();

    // Logger l'activité de connexion
    await ActivityLog.logActivity({
      userId: user._id,
      activityType: 'login',
      description: 'Connexion au compte',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

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
    const { firstName, lastName, phone, profilePhoto } = req.body;

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
    
    // Mettre à jour la photo de profil (base64)
    if (profilePhoto !== undefined) {
      user.profilePhotoUrl = profilePhoto;
    }

    await user.save();

    // Logger l'activité de mise à jour du profil
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'profile_updated',
      description: 'Profil mis à jour',
      details: { updatedFields: Object.keys(req.body).filter(k => req.body[k] !== undefined) }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profilePhotoUrl: user.profilePhotoUrl
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

    // Créer le profil Driver ou Employer selon le rôle choisi
    if (role === 'driver') {
      // Vérifier si le profil existe déjà
      const existingDriver = await Driver.findOne({ userId: user._id });
      
      if (!existingDriver) {
        try {
          const driverData = {
            userId: user._id,
            firstName: user.firstName || 'Prénom',
            lastName: user.lastName || 'Nom',
            phone: user.phone || '06 00 00 00 00',
            email: user.email,
            licenseType: 'B', // Valeur par défaut
            licenseNumber: `B${Math.random().toString().substr(2, 9)}`,
            licenseDate: new Date('2020-01-01'),
            experience: '<1',
            vehicleType: 'berline',
            vehicleBrand: 'Renault',
            vehicleModel: 'Clio',
            vehicleYear: 2020,
            vehicleSeats: 5,
            workZone: 'Abidjan',
            specialties: ['transport_personnel'],
            status: 'approved',
            isAvailable: true,
            profilePhotoUrl: user.profilePhotoUrl || '' // Utiliser la photo Google si disponible
          };

          await Driver.create(driverData);
          console.log(`✅ Profil chauffeur créé pour ${user.firstName} ${user.lastName}`);
        } catch (driverError) {
          console.error('❌ Erreur lors de la création du profil chauffeur:', driverError);
        }
      } else {
        console.log(`ℹ️ Profil chauffeur existe déjà pour ${user.email}`);
      }
    }

    if (role === 'employer') {
      // Vérifier si le profil existe déjà
      const existingEmployer = await Employer.findOne({ userId: user._id });
      
      if (!existingEmployer) {
        try {
          const employerData = {
            userId: user._id,
            firstName: user.firstName || 'Prénom',
            lastName: user.lastName || 'Nom',
            email: user.email,
            phone: user.phone || '',
            status: 'approved',
            isActive: true
          };

          await Employer.create(employerData);
          console.log(`✅ Profil employeur créé pour ${user.firstName} ${user.lastName}`);
        } catch (employerError) {
          console.error('❌ Erreur lors de la création du profil employeur:', employerError);
        }
      } else {
        console.log(`ℹ️ Profil employeur existe déjà pour ${user.email}`);
      }
    }

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
