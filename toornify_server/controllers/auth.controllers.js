import UserModel from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  extractInput,
  generateAccessAndRefreshToken,
} from "../utils/helper.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { name, email, password } = extractInput(req, [
    "name",
    "email",
    "password",
  ]);

  // Extract role separately as it's optional
  const role = req.body.role || req.query.role || req.params.role;

  // Validate role if provided
  const allowedRoles = ["user", "organiser", "creator", "player"];
  if (role && !allowedRoles.includes(role)) {
    throw new ApiErrorResponse(400, "Invalid role. Allowed roles are: user, organiser, creator, player");
  }

  let doesUserExists = await UserModel.findOne({
    email: email,
  });

  if (doesUserExists)
  return res
    .status(200)
    .json(new ApiResponse(403, {}, "User Already Exists!"));
  // Generate unique username
  let baseUsername = name.replace(/\s+/g, "_").toLowerCase();
  let username = baseUsername;
  let counter = 1;
  while (await UserModel.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  let createUser = await UserModel.create({
    name: name,
    email: email,
    password: password,
    username: username,
    role: role || "user", // Use provided role or default to "user"
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  if (!createUser) throw new ApiErrorResponse(400, "something went wrong!");


  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      createUser._id
  );
  const loggedInUser = await UserModel.aggregate([
    {
      $match: {
        _id: createUser._id,
      },
    },

  ]);

  return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {loggedInUser: loggedInUser[0], authToken: accessToken}, "Login successful!"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = extractInput(req, ["email", "password"]);

  const existingUser = await UserModel.findOne({
    email: email,
  });
  if (!existingUser)
    throw new ApiErrorResponse(400, "User not found, please register!");

  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiErrorResponse(403, "Wrong password!");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await UserModel.aggregate([
    {
      $match: {
        _id: existingUser._id,
      },
    },

  ]);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {loggedInUser: loggedInUser[0], authToken: accessToken}, "Login successful!"));
});

const signOut = asyncHandler(async (req, res) => {
  res.cookie("accessToken", "", { maxAge: 1 });
  res.cookie("refreshToken", "", { maxAge: 1 });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "You are logged out successfully!"));
});

const googleAuthCallback = asyncHandler(async (req, res) => {
  // User is authenticated via Google
  const user = req.user;

  if (!user) {
    throw new ApiErrorResponse(400, "Authentication failed");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await UserModel.aggregate([
    {
      $match: {
        _id: user._id,
      },
    },
  ]);

  // Get redirect_uri from query or use default
  const redirectUri = req.query.redirect_uri || req.query.state || process.env.FRONTEND_URL || 'http://localhost:5173/auth/callback';

  // Set cookies
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);

  // Redirect to frontend with tokens in URL (for SPAs that can't access httpOnly cookies immediately)
  const redirectUrl = new URL(redirectUri);
  console.log("Google callback - redirecting to:", redirectUrl.toString());
  redirectUrl.searchParams.append('token', accessToken);
  redirectUrl.searchParams.append('refreshToken', refreshToken);
  redirectUrl.searchParams.append('user', JSON.stringify({
    id: loggedInUser[0]._id,
    email: loggedInUser[0].email,
    username: loggedInUser[0].username,
    token:accessToken,
    name: loggedInUser[0].name || loggedInUser[0].fullName
  }));

  return res.redirect(redirectUrl.toString());
});

const discordAuthCallback = asyncHandler(async (req, res) => {
  // User is authenticated via Discord
  const user = req.user;

  console.log("Discord callback - req.user:", req.user);
  console.log("Discord callback - req.authInfo:", req.authInfo);
  console.log("Discord callback - req.query:", req.query);

  if (!user) {
    console.error("Discord authentication failed - no user object");
    throw new ApiErrorResponse(400, "Discord authentication failed - no user found");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await UserModel.aggregate([
    {
      $match: {
        _id: user._id,
      },
    },
  ]);

  // Get redirect_uri from query or use default
  const redirectUri = req.query.redirect_uri || req.query.state || process.env.FRONTEND_URL || 'http://localhost:5173/auth/callback';

  // Set cookies
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);

  // Redirect to frontend with tokens in URL (for SPAs that can't access httpOnly cookies immediately)
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.append('token', accessToken);
  redirectUrl.searchParams.append('refreshToken', refreshToken);
  redirectUrl.searchParams.append('user', JSON.stringify({
    id: loggedInUser[0]._id,
    email: loggedInUser[0].email,
    username: loggedInUser[0].username,
    token: accessToken,
    name: loggedInUser[0].name || loggedInUser[0].fullName
  }));

  return res.redirect(redirectUrl.toString());
});

// Get available authentication methods
const getAuthMethods = asyncHandler(async (req, res) => {
  const availableMethods = {
    email: true,
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
  };

  return res.status(200).json(
    new ApiResponse(200, availableMethods, "Available authentication methods")
  );
});

export { registerUser, loginUser, signOut, googleAuthCallback, discordAuthCallback, getAuthMethods };
