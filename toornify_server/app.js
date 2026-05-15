import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import "./utils/passport.config.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/users.routes.js";
import chatRouter from "./routes/chat.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import path from "path";
import { fileURLToPath } from "url";
import tournamentRoutes from "./routes/tournaments.routes.js";
import gamesRoutes from "./routes/games.routes.js";
import teamsRoute from "./routes/teams.routes.js";
import playerRoute from "./routes/players.routes.js";
import bracketsRoute from "./routes/brackets.routes.js";
import newsRouter from "./routes/news.routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.resolve('./public')));

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(cookieParser());

// Session middleware for passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/test", (req, res) => {
  res.render("test");
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  if (dbState === 1) {
    res.status(200).json({
      status: 'ok',
      database: states[dbState],
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'error',
      database: states[dbState],
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/chat", chatRouter);


app.use("/api/v1/tournaments", tournamentRoutes);

app.use("/api/v1/games", gamesRoutes);

app.use("/api/v1/teams",teamsRoute);

app.use("/api/v1/players", playerRoute);

app.use("/api/v1/brackets", bracketsRoute);

app.use("/api/v1/news", newsRouter);
app.use(errorHandler);
export { app };
