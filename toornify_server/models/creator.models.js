import mongoose from "mongoose";

const CreatorSchema = new mongoose.Schema(
    {
        platformId: { type: String, required: false, unique: true },

        firstName: { type: String, required: true },
        middleName: String,
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: String,
        country: { type: String, required: true },
        state: String,
        city: String,

        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },

        instagram: String,
        linkedin: String,
        youtube: String,
        twitch: String,

        languages: [String],
        teamOrOrg: String,
        niche: String,
        equipments: String,
        yearsOfExperience: Number,
        sampleWorkLinks: { type: [String], default: [] },
        monetizationPlatforms: String,

        profilePic: String,
        bannerPic: String,
        bio: String,
    },
    { timestamps: true }
);

export default mongoose.models.Creator || mongoose.model("Creator", CreatorSchema);
