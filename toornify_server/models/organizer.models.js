import mongoose from "mongoose";
const { Schema } = mongoose;

const organiserSchema = new Schema(
  {
    // Reference to UserModel
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true, // mark required if every organiser must belong to a user
    },


    platformId: {
      type: String,
      required: false,
      unique: true, // auto-generated
    },

    // PERSONAL INFO
    firstName: { type: String, required: [true, "First name is required"] },
    middleName: { type: String },
    lastName: { type: String, required: [true, "Last name is required"] },
    dateOfBirth: { type: Date, required: [true, "Date of birth is required"] },
    country: { type: String, required: [true, "Country is required"] },
    state: { type: String, required: [true, "State is required"] },
    city: { type: String, required: [true, "City is required"] },
    languages: { type: [String], default: [] },
    referralCode: { type: String },

    // CONTACT INFO
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    socialLogin: {
      type: String,
      default: "none",
    },
    instagram: { type: String },
    linkedin: { type: String },

    // ORGANISER TYPE/ORG INFO
    organiserType: {
      type: String,

      required: [true, "Organiser type is required"],
    },
    organisationName: {
      type: String,
      required: function () {
        return this.organiserType !== "Individual Organizer";
      },
      trim: true,
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    // GAMES (reference array)
    gameTitles: [{ type: 'String' }],
    requestedGame: { type: String },

    // BRANDING
    logo: { type: String }, // image URL/path
    website: { type: String },
    instagramHandle: { type: String },
    discordServer: { type: String },
    youtubeChannel: { type: String },

    // VERIFICATION & PAYOUT
    govtId: { type: String }, // KYC file (JPEG/PDF URL/path)
    panOrGovtId: { type: String },
    upiId: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
    },
    gstNumber: { type: String },
  },
  { timestamps: true }
);

const OrganiserModel =
  mongoose.models.OrganiserModel || mongoose.model("OrganiserModel", organiserSchema);

export default OrganiserModel;
