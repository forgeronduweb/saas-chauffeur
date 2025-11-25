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
      const startTime = Date.now();
      
      try {
        console.log('🔐 Google OAuth Strategy - Profile reçu:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          timestamp: new Date().toISOString()
        });

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('❌ Aucun email dans le profil Google');
          return done(new Error('Email requis pour l\'authentification Google'), null);
        }

        // Timeout pour éviter les blocages
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout lors de l\'authentification Google')), 10000);
        });

        const authPromise = (async () => {
          // Vérifier si l'utilisateur existe déjà avec Google ID
          console.log('🔍 Recherche utilisateur avec Google ID:', profile.id);
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ Utilisateur existant trouvé avec Google ID:', user.email);
            const duration = Date.now() - startTime;
            console.log(`⏱️ Auth completed in ${duration}ms`);
            return done(null, user);
          }

          // Vérifier si un utilisateur avec cet email existe déjà
          console.log('🔍 Recherche utilisateur avec email:', email);
          user = await User.findOne({ email });
          
          if (user) {
            // Lier le compte Google à l'utilisateur existant
            console.log('🔗 Liaison du compte Google à l\'utilisateur existant');
            user.googleId = profile.id;
            user.authProvider = 'google';
            if (profile.photos?.[0]?.value) {
              user.profilePhotoUrl = profile.photos[0].value;
            }
            
            await user.save();
            console.log('✅ Compte Google lié à l\'utilisateur existant:', user.email);
            const duration = Date.now() - startTime;
            console.log(`⏱️ Auth completed in ${duration}ms`);
            return done(null, user);
          }

          // Créer un nouvel utilisateur
          console.log('👤 Création d\'un nouvel utilisateur');
          const names = profile.displayName?.split(' ') || ['', ''];
          const newUser = new User({
            googleId: profile.id,
            email: email,
            firstName: profile.name?.givenName || names[0] || 'Utilisateur',
            lastName: profile.name?.familyName || names.slice(1).join(' ') || 'Google',
            profilePhotoUrl: profile.photos?.[0]?.value,
            isActive: true,
            role: 'client', // Rôle temporaire
            authProvider: 'google',
            needsRoleSelection: true,
            emailVerified: true // Google emails sont pré-vérifiés
          });

          await newUser.save();
          console.log('✅ Nouvel utilisateur créé via Google:', {
            email: newUser.email,
            id: newUser._id,
            needsRoleSelection: newUser.needsRoleSelection
          });
          
          const duration = Date.now() - startTime;
          console.log(`⏱️ Auth completed in ${duration}ms`);
          done(null, newUser);
        })();

        // Race entre l'authentification et le timeout
        await Promise.race([authPromise, timeoutPromise]);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error('❌ Erreur dans Google OAuth Strategy:', {
          error: error.message,
          stack: error.stack,
          duration: `${duration}ms`,
          profileId: profile?.id,
          email: profile?.emails?.[0]?.value
        });
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
