import { loginUser, registerUser, signOut, googleAuthCallback, discordAuthCallback, getAuthMethods } from "../controllers/auth.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import passport from "passport";

const defaultFrontendCallback = process.env.FRONTEND_URL || "http://localhost:5173/auth/callback";

console.log("🔍 Auth Routes - Environment Check:");
console.log("  GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Not set");
console.log("  GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Not set");
console.log("  DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID ? "✅ Set" : "❌ Not set");
console.log("  DISCORD_CLIENT_SECRET:", process.env.DISCORD_CLIENT_SECRET ? "✅ Set" : "❌ Not set");

const authRouter = Router();

authRouter.route("/signup").post(registerUser);
authRouter.route("/signin").post(loginUser);
authRouter.route('/signout').post(verifyJWT, signOut);
authRouter.route('/methods').get(getAuthMethods); // Get available auth methods

// Google OAuth routes - Only register if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authRouter.get(
    "/google",
    (req, res, next) => {
      const redirect_uri = req.query.redirect_uri || defaultFrontendCallback;
      passport.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect_uri, // Pass redirect_uri as state
      })(req, res, next);
    }
  );

  authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login?error=google_auth_failed",
      session: false,
    }),
    googleAuthCallback
  );
  console.log("✅ Google OAuth routes registered");
} else {
  console.log("⏭️  Google OAuth routes skipped (credentials not configured)");
}

// Discord OAuth routes - Only register if credentials are configured
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  authRouter.get(
    "/discord",
    (req, res, next) => {
      const redirect_uri = req.query.redirect_uri || defaultFrontendCallback;
      passport.authenticate("discord", {
        scope: ["identify", "email"],
        state: redirect_uri, // Pass redirect_uri as state
      })(req, res, next);
    }
  );

  authRouter.get(
    "/discord/callback",
    (req, res, next) => {
      passport.authenticate("discord", {
        failureRedirect: "/login?error=discord_auth_failed",
        session: false,
      }, (err, user, info) => {
        if (err) {
          console.error("Discord callback - Authentication error:", err);
          return res.status(500).json({
            statusCode: 500,
            data: null,
            success: false,
            errors: [],
            message: `Discord authentication error: ${err.message}`
          });
        }
        if (!user) {
          console.error("Discord callback - No user returned, info:", info);
          return res.status(401).json({
            statusCode: 401,
            data: null,
            success: false,
            errors: [],
            message: "Discord authentication failed - no user found"
          });
        }
        req.user = user;
        next();
      })(req, res, next);
    },
    discordAuthCallback
  );
  console.log("✅ Discord OAuth routes registered");
} else {
  console.log("⏭️  Discord OAuth routes skipped (credentials not configured)");
}

export default authRouter;
