import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  // Reference to UserModel
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true, // mark required if every organiser must belong to a user
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  middleName: {
    type: String,
    required: false,
  },
  lastName: { type: String, required: [true, "Last name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  PhoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
  },
  dateofBirth: {
    type: String,
    required: [true, "Date of Birth is required"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  language: {
    type: [String],
    required: false,
  },
  referralCode: { type: String, required: false },
  socialLoginType: {
    type: String,

    default: "none",
  },
  instituteName: {
    type: String,
    required: false,
    unique: true,
  },

  educationStatus: {
    type: String,

  },
  graduatingYear: {
    type: String,
    validate: {
      validator: function (value) {
        if (
          this.educationStatus === "School Student" ||
          this.educationStatus === "College Student"
        ) {
          return value != null; // graduatingYear must be provided
        }
        return true; // graduatingYear is not required for other statuses
      },
      message:
        "Graduating year is required for School Student or College Student",
    },
  },
  gameProfile: [
    {
      gameName: {
        type: String,
        required: [true, "Game Name is required"],
      },
      ingameUsername: {
        type: String,
        required: [true, "Ingame Username is required"],
      },
      ingameId: {
        type: String,
        required: [true, "Ingame ID is required"],
      },
      platform: {
        type: String,
        required: [true, "Platform is required"],
      },
      rank: {
        type: String,
      },
      rankScreenshot: {
        type: String,
        validate: {
          validator: function (value) {
            // rankScreenshot is required if rank is provided
            if (this.rank) {
              return value != null && value !== "";
            }
            return true;
          },
          message: "Rank Screenshot is required if Rank has been selected",
        },
      },
      statsUrl: {
        type: String,
      },
      teamName: {
        type: String,
      },
    },
  ],

  preferredRole: {
    type: String,

    required: false, // Optional field
  },
  profilePicture: {
    type: String,
    validate: {
      validator: function (value) {
        // Assuming the value is a URL or base64 string, you can add logic to validate the size
        // For example, if the size is passed as metadata, you can validate it here
        // This is a placeholder for actual size validation logic
        return true; // Replace with actual size validation logic if needed
      },
      message: "Profile picture exceeds the allowed size limit",
    },
  },
});

// Create Model
const PlayerModel =
  mongoose.models.PlayerModel || mongoose.model("PlayerModel", playerSchema);

// Export using CommonJS
export default PlayerModel;
