import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import UserModel from "../models/users.models.js";

const getServerBaseUrl = () => {
  if (process.env.SERVER_URL) return process.env.SERVER_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:8002";
};

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy - Only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Determine callback URL based on environment
  const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL ||
    `${getServerBaseUrl()}/api/v1/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await UserModel.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with this email
          user = await UserModel.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            // Link Google ID to existing user
            user.googleId = profile.id;
            if (!user.image) user.image = profile.photos?.[0]?.value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          let baseUsername = (profile.displayName || profile.emails?.[0]?.value?.split("@")[0])
            .replace(/\s+/g, "_")
            .toLowerCase();
          let username = baseUsername;
          let counter = 1;

          while (await UserModel.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          const newUser = await UserModel.create({
            username: username,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
            image: profile.photos?.[0]?.value,
            emailVerified: new Date(),
          });

          return done(null, newUser);
        } catch (error) {
          console.error('Google OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log("✅ Google OAuth Strategy configured");
  console.log(`   Callback URL: ${googleCallbackURL}`);
}
// Google OAuth is optional - no warning needed if not configured

// Discord Strategy - Only configure if credentials are available
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  // Determine callback URL based on environment
  const discordCallbackURL = process.env.DISCORD_CALLBACK_URL ||
    `${getServerBaseUrl()}/api/v1/auth/discord/callback`;

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: discordCallbackURL,
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Discord OAuth - Profile received:", {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            verified: profile.verified
          });

          // Check if user already exists with this Discord ID
          let user = await UserModel.findOne({ discordId: profile.id });

          if (user) {
            console.log("Discord OAuth - Existing user found by discordId:", user._id);
            return done(null, user);
          }

          // Check if user exists with this email
          if (profile.email) {
            user = await UserModel.findOne({ email: profile.email });

            if (user) {
              console.log("Discord OAuth - Existing user found by email, linking Discord ID:", user._id);
              // Link Discord ID to existing user
              user.discordId = profile.id;
              if (!user.image) user.image = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          let baseUsername = (profile.username || profile.email?.split("@")[0] || `discord_${profile.id}`)
            .replace(/\s+/g, "_")
            .toLowerCase();
          let username = baseUsername;
          let counter = 1;

          while (await UserModel.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          console.log("Discord OAuth - Creating new user with username:", username);

          const newUser = await UserModel.create({
            username: username,
            name: profile.username,
            email: profile.email || null,
            discordId: profile.id,
            image: profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : null,
            emailVerified: profile.verified ? new Date() : null,
          });

          console.log("Discord OAuth - New user created:", newUser._id);
          return done(null, newUser);
        } catch (error) {
          console.error('Discord OAuth Error:', error);
          console.error('Discord OAuth Error Stack:', error.stack);
          return done(error, null);
        }
      }
    )
  );
  console.log("✅ Discord OAuth Strategy configured");
  console.log(`   Callback URL: ${discordCallbackURL}`);
}
// Discord OAuth is optional - no warning needed if not configured

export default passport;
