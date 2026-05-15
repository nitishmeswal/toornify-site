import mongoose from "mongoose";
import { type } from "os";

const matchSchema = new mongoose.Schema({
    round: {
        type: Number,
        required: true,
    },
    team1: {
        type: String,
        required: false,
    },
    team2: {
        type: String,
        required: false,
    },
    winner: {
        type: String,
        default: "",
    },
});

const bracketSchema = new mongoose.Schema({
    tournament_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Tournament",
    },
    tournament_name: {
        type: String,
        required: true,
        trim: true,
    },
    format: {
        type: String,
        enum: ["single_elimination", "double_elimination", "round_robin"],
        required: true,
    },
    consolationFinal: {
        type: Boolean,
        default: false,
    },
    grandFinalType: {
        type: String,
        enum: ["simple", "double"],
        required: true,
    },
    teams: {
        type: [String], // Array of team names
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 2; // Ensure at least 2 teams
            },
            message: "Number of teams must be at least 2.",
        },
    },
    matches: {
        type: [matchSchema],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true,"creator id is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Add indexes for performance optimization
bracketSchema.index({ userId: 1 });
bracketSchema.index({ tournament_id: 1 });
bracketSchema.index({ format: 1 });
bracketSchema.index({ createdAt: -1 });
bracketSchema.index({ userId: 1, tournament_id: 1 });
bracketSchema.index({ format: 1, createdAt: -1 });

// Create model using CommonJS syntax
const BracketModel =  new mongoose.model("Bracket", bracketSchema);

// Export using CommonJS
export default BracketModel;
