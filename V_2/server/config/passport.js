const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configuration de la stratégie Google OAuth
// Vérifier si les identifiants Google sont configurés
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        proxy: true
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google OAuth - Profile reçu:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName
        });

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('✅ Utilisateur existant trouvé:', user.email);
          return done(null, user);
        }

        // Vérifier si un utilisateur avec cet email existe déjà
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          
          if (user) {
            // Lier le compte Google à l'utilisateur existant
            user.googleId = profile.id;
            if (profile.photos?.[0]?.value) {
              user.profilePhotoUrl = profile.photos[0].value;
            }
            await user.save();
            console.log('✅ Compte Google lié à l\'utilisateur existant:', user.email);
            return done(null, user);
          }
        }

        // Créer un nouvel utilisateur sans rôle (sera choisi après)
        const names = profile.displayName?.split(' ') || ['', ''];
        const newUser = new User({
          googleId: profile.id,
          email: email,
          firstName: profile.name?.givenName || names[0] || 'Utilisateur',
          lastName: profile.name?.familyName || names.slice(1).join(' ') || 'Google',
          profilePhotoUrl: profile.photos?.[0]?.value,
          isActive: true,
          role: 'client', // Rôle temporaire, sera changé lors de la sélection
          authProvider: 'google',
          needsRoleSelection: true // Flag pour indiquer qu'il faut choisir un rôle
        });

        await newUser.save();
        console.log('✅ Nouvel utilisateur créé via Google:', newUser.email);
        console.log('🔍 needsRoleSelection:', newUser.needsRoleSelection);
        console.log('🔍 role:', newUser.role);
        done(null, newUser);
      } catch (error) {
        console.error('❌ Erreur lors de l\'authentification Google:', error);
        done(error, null);
      }
    }
  )
  );
  console.log('✅ Google OAuth configuré');
} else {
  console.log('⚠️  Google OAuth non configuré - Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env');
}

module.exports = passport;
