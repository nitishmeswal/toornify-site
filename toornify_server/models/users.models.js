import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// User Schema
const userSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Allow multiple null/undefined values
            lowercase: true,
            match: [/.+@.+\..+/, "Please enter a valid email address"],
        },
        emailVerified: {
            type: Date,
            default: null,
        },
        image: {
            type: String,
        },
        profilePic: {
            type: String,
        },
        bio: {
            type: String,
            trim: true,
        },
        discordId: {
            type: String,
            default: null,
        },
        googleId: {
            type: String,
            default: null,
        },
        linkedInId: {
            type: String,
            default: null,
        },
        twoFactorActivated: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            default: null,
        },
        verifyCode: {
            type: String,
            default: null,
        },
        verifyCodeExpiry: {
            type: Date,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "organiser", "creator", "player", "admin"],
            default: "user",
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        accounts: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        eventsRegistered: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tournament",
            },
        ],
        tournaments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tournament",
            },
        ],
        brackets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Bracket",
            },
        ],
        games: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Game",
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Add indexes for performance optimization
// Note: email and username already have unique indexes from schema definition
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, role: 1 }, { sparse: true }); // Sparse index for optional email
userSchema.index({ username: "text", name: "text" }); // Text search

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    //short lived access token

    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY ||"7d" }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    //short lived access token

    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY||"7d" }
    );
};

const UserModel =
     mongoose.model("UserModel", userSchema);

// Export using CommonJS
export default UserModel;
