import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    image: {type: String},
    teamname: {type: String, required: true},
    logo: {
        type: String, required: false
    },
    logo_url: {type: String, required: false},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Games",
        required: true,
    },

    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
            required: true,
        },
    ],
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
        },
    ],
}, {
    timestamps: true,
});

// Add indexes for performance optimization
TeamSchema.index({owner: 1});
TeamSchema.index({game: 1});
TeamSchema.index({teamname: 1});
TeamSchema.index({createdAt: -1});
TeamSchema.index({owner: 1, game: 1});
TeamSchema.index({game: 1, createdAt: -1});
TeamSchema.index({teamname: "text"}); // For text search
TeamSchema.index({owner: 1, createdAt: -1});

const TeamModel =
    mongoose.model("TeamModel", TeamSchema);

export default TeamModel;
