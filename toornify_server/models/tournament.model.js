import mongoose, {Schema} from "mongoose";


const TournamentSchema = new mongoose.Schema(
    {
        tournamentName: { type: String, required: true },
        tournamentDates: {
            created: { type: Date, default: Date.now },
            started: Date,
            ended: Date,
        },
        schedules: Schema.Types.Mixed,
        organizerId: {
            type: Schema.Types.ObjectId,
            ref: "Organizer",
        },
        gameType: { type: String, enum: ["SQUAD", "SOLO", "DUO"], required: true },
        gameId: { type: Schema.Types.ObjectId, ref: "Games", required: true },
        links: Schema.Types.Mixed,
        gameBannerPhoto: String,
        results: [Schema.Types.Mixed],
        teamsRegistered: [

        ],
        participantCount: {
            type: Number,
            min: 1,
        },
        rounds: [Schema.Types.Mixed],
        teamSize: { type: Number, min: 1 },
        prize: [Schema.Types.Mixed],
        howToX: [String],
        rules: [String],
        slots: { type: Number, min: 1 },
        email: { type: String, lowercase: true, trim: true },
        registeredNumber: { type: Number, default: 0, min: 0 },
        tournamentFormat: String,
        registrationEndDate: Date,
        tournamentStartDate: Date,
        tournamentEndDate: Date,
        maxTeamMembers: { type: Number, min: 1 },
        minTeamMembers: { type: Number, min: 1 },
        entryFee:{ type: Number, min: 100, default: 0},
        maxTeams: { type: Number, min: 1 },
        minTeams: { type: Number, min: 1 },
        tournamentVisibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
        inviteCode: String,
        prizeConfig: [Schema.Types.Mixed],
        sponsors: [Schema.Types.Mixed],
        gameParameter: String,
        parameterPoints: String,
        roundType: String,
        numberOfMatches: { type: Number, min: 1 },
        qualifyingTeamsPerGroup: { type: Number, min: 0 },
        wildcardPlayers: { type: Number, min: 0 },
        teamsPerGroup: { type: Number, min: 1 },
        roundName: String,
        tournamentIcon: String,
        tournamentBanner: String,
        selectedPlatform: String,
        participantType: String,
        selectedTimezone: String,
        size: String,
        brackets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bracket" }],

        // Relation with the User model
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserModel",
            },
        ],
    },
    { timestamps: true },
);

// Add indexes for performance optimization
TournamentSchema.index({ gameType: 1 });
TournamentSchema.index({ gameId: 1 });
TournamentSchema.index({ organizerId: 1 });
TournamentSchema.index({ "tournamentDates.started": -1 });
TournamentSchema.index({ tournamentName: 1 });
TournamentSchema.index({ tournamentVisibility: 1 });
TournamentSchema.index({ gameType: 1, gameId: 1 });
TournamentSchema.index({ gameType: 1, "tournamentDates.started": -1 });
TournamentSchema.index({ tournamentName: "text" }); // For text search

const TournamentModel =
    mongoose.model("Tournament", TournamentSchema)

export default TournamentModel;
