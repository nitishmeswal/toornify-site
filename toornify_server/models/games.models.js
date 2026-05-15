// model/Games.js
import mongoose from "mongoose";

const GamesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Game name is required'],
        trim: true,
        maxlength: [100, 'Game name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    genre: {
        type: String,
        trim: true,
        maxlength: [50, 'Genre cannot exceed 50 characters']
    },
    profile: String,
    gameBannerPhoto: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v) || v.startsWith('/') || v.startsWith('data:');
            },
            message: 'Invalid image URL format'
        }
    },
    players: [
        {
            type: mongoose.Types.ObjectId,
            ref: "UserModel",
        },
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    playerCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
GamesSchema.index({ name: 1 }, { unique: true });
GamesSchema.index({ category: 1 });
GamesSchema.index({ genre: 1 });
GamesSchema.index({ isActive: 1 });
GamesSchema.index({ createdAt: -1 });
GamesSchema.index({ name: "text", description: "text" }); // Text search index
GamesSchema.index({ category: 1, isActive: 1 });
GamesSchema.index({ genre: 1, isActive: 1 });
GamesSchema.index({ isActive: 1, createdAt: -1 });



const Games =  mongoose.model("Games", GamesSchema);

export default Games;
