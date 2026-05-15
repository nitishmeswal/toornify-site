import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiErrorResponse} from "../utils/ApiErrorResponse.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Address} from "../models/address.models.js";
import {extractInput} from "../utils/helper.js";
import UserModel from "../models/users.models.js";
import OrganizerModel from "../models/organizer.models.js";
import Creator from "../models/creator.models.js";
import PlayerModel from "../models/player.models.js";
import UsersModels from "../models/users.models.js";
import mongoose from "mongoose";


const updateAddress = asyncHandler(async (req, res) => {
    const {state, city, street, postalCode} = extractInput(req, [
        "state",
        "city",
        "street",
        "postalCode",
    ]);
    let user = await UserModel.findById(req.user._id);

    if (!user) throw new ApiErrorResponse(400, "user not found");

    let updateAddress = await Address.create({
        user: req.user._id,
        city: city,
        state: state,
        street: street,
        postalCode: postalCode,
    });

    if (!updateAddress) throw new ApiErrorResponse(400, "something went wrong");

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Address updated Successfully"));
});
const userDetails = asyncHandler(async (req, res) => {
    console.log(req.user);
    const email = req.user.email;
    const user = await UsersModels.aggregate([
        {$match: {email: email}},
    ]);
    if (!user) throw new ApiErrorResponse(400, "user not found");

    return res.status(200).json(new ApiResponse(200, user[0], "Success"));
});

const getUserById = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const user = await UsersModels.findById(new mongoose.Types.ObjectId(userId));

    if(!user) return res.status(200).json(new ApiResponse(404,null, "User not found"));

    return res.status(200).json(new ApiResponse(200, user, "Success"));
});
const updateProfile = asyncHandler(async (req, res) => {
    console.log(req.body);

    const {type} = extractInput(req, ["type"]);
    const email = req.user.email;
    if (type === UserTypes.CREATOR) {
        const {
            platformId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            country,
            state,
            city,
            phoneNumber,
            languages,
            teamOrOrg,
            niche,
            equipments,
            yearsOfExperience,
            sampleWorkLinks,
            monetizationPlatforms,
            bio
        } = extractInput(req, [
            "platformId",
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
            "country",
            "state",
            "city",
            "phoneNumber",
            "languages",
            "teamOrOrg",
            "niche",
            "equipments",
            "yearsOfExperience",
            "sampleWorkLinks",
            "monetizationPlatforms",
            "bio"
        ]);

        // Extract optional fields separately
        let bannerPic, profilePic;
        if (req.files && req.files['profilePic']) {
            profilePic = `/public/data/uploads/${req.files['profilePic'][0].filename}`;
        }
        if (req.files && req.files['bannerPic']) {
            bannerPic = `/public/data/uploads/${req.files['bannerPic'][0].filename}`;
        }
        const instagram = req.body.instagram || req.query.instagram || req.params.instagram;
        const linkedin = req.body.linkedin || req.query.linkedin || req.params.linkedin;
        const youtube = req.body.youtube || req.query.youtube || req.params.youtube;
        const twitch = req.body.twitch || req.query.twitch || req.params.twitch;

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !country || !email || !phoneNumber) {
            throw new ApiErrorResponse(400, "Required fields are missing");
        }

        // Create new creator profile
        const updatedCreator = await Creator.create({
            user: req.user._id,
            platformId,
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            country,
            state,
            city,
            email: req.user.email,
            phoneNumber,
            instagram,
            linkedin,
            youtube,
            twitch,
            languages: languages,
            teamOrOrg,
            niche,
            equipments,
            yearsOfExperience,
            sampleWorkLinks: Array.isArray(sampleWorkLinks) ? sampleWorkLinks : sampleWorkLinks ? [sampleWorkLinks] : [],
            monetizationPlatforms,
            profilePic,
            bannerPic,
            bio,
        });

        // Update user role and profile complete
        await UserModel.findOneAndUpdate(
            {email: req.user.email},
            {
                role: "creator",
                isProfileComplete: true,
                profilePic: profilePic,
            }
        );

        res.status(200).json(new ApiResponse(200, updatedCreator, "Creator profile updated successfully"));
    } else if (type === UserTypes.PLAYER) {
        const {
            firstName,
            lastName,
            PhoneNumber,
            dateofBirth,
            country,
            state,
            city,
            institution,
            gameProfiles,
            preferredRole
        } = extractInput(req, [
            "firstName",
            "lastName",
            "PhoneNumber",
            "dateofBirth",
            "country",
            "state",
            "city",
            "institution",
            "gameProfiles",
            "preferredRole"
        ]);

        // Extract optional fields separately
        let profilePicture;
        if (req.files && req.files['profilePic']) {
            profilePicture = `/public/data/uploads/${req.files['profilePic'][0].filename}`;
        }

        // Validate required fields
        if (!firstName || !lastName || !PhoneNumber || !dateofBirth || !country || !state || !city) {
            throw new ApiErrorResponse(400, "Required fields are missing");
        }

        // Create new player profile
        const updatedPlayer = await PlayerModel.create({
            user: req.user._id,
            firstName,
            lastName,
            email: req.user.email,
            PhoneNumber,
            dateofBirth,
            country,
            state,
            city,
            institution,
            gameProfiles: Array.isArray(gameProfiles) ? gameProfiles : gameProfiles ? [gameProfiles] : [],
            preferredRole,
            profilePicture,
        });

        // Update user role and profile complete
        await UserModel.findOneAndUpdate(
            {email: req.user.email},
            {
                role: "player",
                isProfileComplete: true,
                profilePic: profilePicture,
            }
        );

        res.status(200).json(new ApiResponse(200, updatedPlayer, "Player profile updated successfully"));
    } else if (type === UserTypes.ORGANIZER) {
        const {
            firstName,
            lastName,
            dateOfBirth,
            country,
            state,
            city,
            phone,
            organiserType,
            organisationName,
            locationCity,
            locationState,
            locationCountry,
            gameTitles,
            panId,
            upiId,
            bankAccount,
            bankIfsc,
            bankName
        } = extractInput(req, [
            "firstName",
            "lastName",
            "dateOfBirth",
            "country",
            "state",
            "city",
            "phone",
            "organiserType",
            "organisationName",
            "locationCity",
            "locationState",
            "locationCountry",
            "gameTitles",
            "panId",
            "upiId",
            "bankAccount",
            "bankIfsc",
            "bankName"
        ]);

        // Extract optional fields separately
        let logo;
        if (req.files && req.files['logo']) {
            logo = `/public/data/uploads/${req.files['logo'][0].filename}`;
        }
        const gstNumber = req.body.gstNumber || req.query.gstNumber || req.params.gstNumber;
        const govtId = req.body.govtId || req.query.govtId || req.params.govtId;
        const requestedGame = req.body.requestedGame || req.query.requestedGame || req.params.requestedGame;
        const instagram = req.body.instagram || req.query.instagram || req.params.instagram;
        const linkedin = req.body.linkedin || req.query.linkedin || req.params.linkedin;
        const website = req.body.website || req.query.website || req.params.website;
        const instagramHandle = req.body.instagramHandle || req.query.instagramHandle || req.params.instagramHandle;
        const discordServer = req.body.discordServer || req.query.discordServer || req.params.discordServer;
        const youtubeChannel = req.body.youtubeChannel || req.query.youtubeChannel || req.params.youtubeChannel;

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !country || !state || !city || !phone || !organiserType) {
            throw new ApiErrorResponse(400, "Required fields are missing");
        }

        // Create new organizer profile
        const updatedOrganizer = await OrganizerModel.create({
            user: req.user._id,
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            country,
            state,
            city,
            email: req.user.email,
            phone,
            instagram,
            linkedin,
            organiserType,
            organisationName,
            location: {
                city: locationCity,
                state: locationState,
                country: locationCountry || "India"
            },
            gameTitles: Array.isArray(gameTitles) ? gameTitles : gameTitles ? [gameTitles] : [],
            requestedGame,
            logo,
            website,
            instagramHandle,
            discordServer,
            youtubeChannel,
            govtId,
            panOrGovtId: panId,
            upiId,
            bankDetails: {
                accountNumber: bankAccount,
                ifsc: bankIfsc,
                bankName: bankName
            },
            gstNumber,
        });

        // Update user role and profile complete
        await UserModel.findOneAndUpdate(
            {email: req.user.email},
            {
                role: "organiser",
                isProfileComplete: true,
                profilePic: logo,
            }
        );

        res.status(200).json(new ApiResponse(200, updatedOrganizer, "Organiser profile updated successfully"));
    } else {
        throw new ApiErrorResponse(400, "Invalid user type");
    }
})

const updateUserRole = asyncHandler(async (req, res) => {
    const {role} = extractInput(req, ["role"]);

    // Validate role
    const allowedRoles = ["user", "organiser", "creator", "player"];
    if (!role || !allowedRoles.includes(role)) {
        throw new ApiErrorResponse(400, "Invalid role. Allowed roles are: user, organiser, creator, player");
    }

    // Update user role
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.user._id,
        {role: role},
        {new: true, runValidators: true}
    );

    if (!updatedUser) {
        throw new ApiErrorResponse(400, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {role: updatedUser.role}, "User role updated successfully"));
});

const getUserRoles = asyncHandler(async (req, res) => {
    const allowedRoles = ["user", "organiser", "creator", "player"];

    return res
        .status(200)
        .json(new ApiResponse(200, {roles: allowedRoles}, "Available user roles"));
});

const UserTypes = Object.freeze({
    CREATOR: "creator",
    PLAYER: "player",
    ORGANIZER: "organiser",
});
export {updateAddress, userDetails, updateProfile, updateUserRole, getUserRoles,getUserById};
