import { asyncHandler } from "../utils/asyncHandler.js";
import TournamentModel from "../models/tournament.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { extractInput } from "../utils/helper.js";
import Games from "../models/games.models.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
import mongoose from "mongoose";
import UserModel from "../models/users.models.js";
import TeamModel from "../models/team.models.js";

const getAllTournaments = asyncHandler(async (req, res) => {
    const now = new Date();

    const tournamentModel = await TournamentModel.aggregate([
        { $match: {} }, {
            $lookup: {
                from: "usermodels",
                localField: "organizerId",
                foreignField: "_id",
                as: "organiser",
                pipeline: [{ $project: { username: 1, email: 1 } }],
            },
        },
        {
            $unwind: "$organiser"
        },
        {
            $addFields: {
                status: {
                    $cond: {
                        if: { $gt: ["$tournamentStartDate", now] },
                        then: "upcoming",
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $lte: ["$tournamentStartDate", now] },
                                        { $gte: ["$tournamentEndDate", now] }
                                    ]
                                },
                                then: "ongoing",
                                else: "completed"
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!tournamentModel) return res.status(200).json(new ApiResponse(200, {}, "No Tournaments found"));
    return res
        .status(200)
        .json(new ApiResponse(200, tournamentModel, "Tournaments fetched successfully"));


})


const createTournament = asyncHandler(async (req, res) => {
    const {
        tournamentName,
        selectedPlatform,
        participantType,
        selectedTimezone,
        size,
        tournamentFormat,
        registrationEndDate,
        tournamentStartDate,
        tournamentEndDate,
        maxTeamMembers,
        minTeamMembers,
        maxTeams,
        minTeams,
        tournamentVisibility,
        gameType,
        game,
        gameImage,
         email,
        prizeConfig
    } = extractInput(req, [
        "tournamentName",
        "selectedPlatform",
        // "participantType",
        "selectedTimezone",
        // "size",
        "tournamentFormat",
        "registrationEndDate",
        "tournamentStartDate",
        "tournamentEndDate",
        "maxTeamMembers",
        "minTeamMembers",
        "maxTeams",
        "minTeams",
        "tournamentVisibility",
        "gameType",
        "game",
        "gameImage",
        "email",
        "prizeConfig",

    ]);
    const entryFee = req.body.entryFee || req.params.entryFee || req.query.entryFee || 0;
    const rules = req.body.rules||req.params.rules||req.query.rules || [];
    const sponsors = req.body.sponsors||req.params.sponsors||req.query.sponsors || [];
    const user = await UserModel.findOne({ email: email });
    if (!user) {
        return res.status(403).json(new ApiErrorResponse(403, "User not found"));
    }
    const games = await Games.findOne({ name: game });
    if (!games) {
        return res.status(403).json(new ApiErrorResponse(401, "No tournaments found"));
    }

    // Handle file uploads
    let tournamentIcon, tournamentBanner;
    if (req.files && req.files['tournamentIcon']) {
        tournamentIcon = `/public/data/uploads/${req.files['tournamentIcon'][0].filename}`;
    }
    if (req.files && req.files['tournamentBanner']) {
        tournamentBanner = `/public/data/uploads/${req.files['tournamentBanner'][0].filename}`;
    }

    // Create tournament
    const tournament = await TournamentModel.create({
        tournamentName,
        selectedPlatform,
        participantType,
        selectedTimezone,
        size,
        tournamentFormat,
        registrationEndDate,
        tournamentStartDate,
        tournamentEndDate,
        maxTeamMembers,
        minTeamMembers,
        maxTeams,
        minTeams,
        tournamentVisibility,
        gameType,
        gameId: games._id,
        gameBannerPhoto: gameImage,
        rules,
        sponsors,
        organizerId: user._id,
        prizeConfig,
        tournamentIcon,
        tournamentBanner,
        entryFee
    });

    if (!tournament) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to create tournament"));
    }
    return res
        .status(201)
        .json(new ApiResponse(201, tournament, "Tournament created successfully"));
});

const getTournamentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new ApiErrorResponse(400, "Invalid tournament ID"));
    }
    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(id) } },

        {
            $lookup: {
                from: "usermodels",
                localField: "organizerId",
                foreignField: "_id",
                as: "organiser",
                pipeline: [{ $project: { username: 1, email: 1 } }],
            },
        },
        {
            $lookup: {
                from: "games",
                localField: "gameId",
                foreignField: "_id",
                as: "game",

            },
        },
        {
            $lookup: {
                from: "brackets",
                localField: "_id",
                foreignField: "tournament_id",
                as: "brackets",
            }
        },
        // Handle teamsRegistered - if they're already objects, keep them; if IDs, look them up
        {
            $addFields: {
                teamsRegisteredIds: {
                    $map: {
                        input: "$teamsRegistered",
                        as: "team",
                        in: {
                            $cond: {
                                if: { $eq: [{ $type: "$$team" }, "objectId"] },
                                then: "$$team",
                                else: "$$team._id"
                            }
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "teammodels",
                localField: "teamsRegisteredIds",
                foreignField: "_id",
                as: "teamsRegistered",
                pipeline: [
                    {
                        $lookup: {
                            from: "usermodels",
                            localField: "players",
                            foreignField: "_id",
                            as: "players",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        email: 1,
                                        avatar: 1,
                                        country: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                organiser: { $arrayElemAt: ["$organiser", 0] },
                game: { $arrayElemAt: ["$game", 0] },
                participants: {
                    $reduce: {
                        input: "$teamsRegistered",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this.players"] }
                    }
                }
            },
        },
        {
            $project: {
                teamsRegisteredIds: 0
            }
        },
        { $limit: 1 },
    ];

    const now = new Date();

    pipeline.push({
        $addFields: {
            status: {
                $cond: {
                    if: { $gt: ["$tournamentStartDate", now] },
                    then: "upcoming",
                    else: {
                        $cond: {
                            if: {
                                $and: [
                                    { $lte: ["$tournamentStartDate", now] },
                                    { $gte: ["$tournamentEndDate", now] }
                                ]
                            },
                            then: "ongoing",
                            else: "completed"
                        }
                    }
                }
            }
        }
    });

    const tournament = await TournamentModel.aggregate(pipeline);

    if (!tournament) {
        return res.status(200).json(new ApiErrorResponse(200, "Tournament not found"));
    }
    if (!tournament[0]) {
        return res.status(200).json(new ApiResponse(200, {}, "Tournament not found"));
    }
    return res.status(200).json(new ApiResponse(200, tournament[0], "Tournament fetched successfully"));

})


const registerForTournament = asyncHandler(async (req, res) => {
    const { tournamentId, teamId } = extractInput(req, ["tournamentId", "teamId"]);
    const tournament = await TournamentModel.findById(new mongoose.Types.ObjectId(tournamentId));
    if (!tournament) {
        return res.status(400).json(new ApiResponse(400, null, "Tournament not found"));
    }
    const team = await TeamModel.findById(new mongoose.Types.ObjectId(teamId));
    if (!team) {
        return res.status(400).json(new ApiResponse(400, null, "Team not found"));
    }
    tournament.teamsRegistered.forEach(register => {
        if (register._id == team.id) {
            return res.status(200).json(new ApiResponse(400, [], "Team already registered for this tournament"));
        }
    });

    tournament.teamsRegistered.push(team);
    await tournament.save();
    return res.status(200).json(new ApiResponse(200, tournament, "Team registered successfully"));
});

const updateVisibility = asyncHandler(async (req, res) => {
    const { tournamentId, visibility } = extractInput(req, ["tournamentId", "visibility"]);
    const tournament = await TournamentModel.findById(new mongoose.Types.ObjectId(tournamentId));
    if (!tournament) {
        return res.status(400).json(new ApiErrorResponse(400, "Tournament not found"));
    }
    tournament.tournamentVisibility = visibility;
    await tournament.save();
    return res.status(200).json(new ApiResponse(200, tournament, "Tournament visibility updated successfully"));
})
export { getAllTournaments, createTournament, getTournamentById, registerForTournament, updateVisibility };
