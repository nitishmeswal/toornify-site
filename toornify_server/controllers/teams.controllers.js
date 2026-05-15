import {asyncHandler} from "../utils/asyncHandler.js";
import TeamModel from "../models/team.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {extractInput} from "../utils/helper.js";
import UserModel from "../models/users.models.js";
import mongoose from "mongoose";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
const getAllTeams = asyncHandler(async(req,res)=>{
    const { gameRole, language, game, email } = req.query;

    // Find user by email from query
    const user = await UserModel.findOne({ email });

    const matchConditions = {};
    if (game) matchConditions.game = new mongoose.Types.ObjectId(game);
    if (language) matchConditions.language = language;

    const pipeline = [];

    // Initial match (before lookups)
    if (Object.keys(matchConditions).length > 0 || gameRole) {
        const initialMatch = { $match: matchConditions };
        if (gameRole) {
            initialMatch.$match.$or = [
                { 'players.role': gameRole },
                { 'players.gameRole': gameRole },
                { gameRole: gameRole }
            ];
        }
        pipeline.push(initialMatch);
    }

    // Lookups
    pipeline.push(
        { $lookup: { from: 'usermodels', localField: 'players', foreignField: '_id', as: "players" } },
        { $lookup: { from: 'games', localField: 'game', foreignField: '_id', as: 'game' } },
        { $unwind: { path: '$game' } }
    );

    // Add isMyTeam logic - compare owner ObjectId with user._id ObjectId
    pipeline.push({
        $set: {
            isMyTeam: {
                $cond: {
                    if: { $eq: ["$owner", "$$userId"] },  // ObjectId == ObjectId
                    then: true,
                    else: false
                }
            }
        }  
    });

    // Execute with let parameter passing user._id
    const teams = await TeamModel.aggregate(pipeline, {
        let: { userId: user?._id }  // Pass ObjectId, not email
    });

    return res.status(200).json(new ApiResponse(200, teams, "Teams fetched successfully"));
});
const getMyTeam = asyncHandler(async(req,res)=>{
    console.log(req.user);
    const {email} = req.user;

    // Extract filter parameters from query
    const { gameRole, language, game } = req.query;

    const user = await UserModel.findOne({email:email});

    if(!user){
        return res.status(200).json(new ApiResponse(200,{}, "User not found"));
    }

    // Build match conditions
    const matchConditions = {
        owner: new mongoose.Types.ObjectId(user._id)
    };

    // Filter by game if provided
    if (game) {
        matchConditions.game = new mongoose.Types.ObjectId(game);
    }

    // Filter by language if provided
    if (language) {
        matchConditions.language = language;
    }

    const pipeline = [
        { $match: matchConditions }
    ];

    // Add lookups for additional data
    pipeline.push(
        {
            $lookup: {
                from: 'usermodels',
                localField: 'players',
                foreignField: '_id',
                as: "players"
            }
        },
        {
            $lookup: {
                from: 'games',
                localField: 'game',
                foreignField: '_id',
                as: 'game'
            }
        },
        {
            $unwind: {
                path: '$game',
                preserveNullAndEmptyArrays: true
            }
        }
    );

    // Filter by game role if provided
    if (gameRole) {
        pipeline.push({
            $match: {
                $or: [
                    { 'players.role': gameRole },
                    { 'players.gameRole': gameRole },
                    { gameRole: gameRole }
                ]
            }
        });
    }

    const teams = await TeamModel.aggregate(pipeline);

    if(!teams || teams.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No teams found"));
    }

    return res.status(200).json(new ApiResponse(200, teams, "User Teams fetched"));
})



const uploadTeamLogo = asyncHandler(async(req,res)=>{
    const id = extractInput(req,["id"]);
    if(!req.file){
        return res.status(400).json(new ApiResponse(400,{}, "No file uploaded"));
    }
    const teamModels = await TeamModel.findById(new mongoose.Types.ObjectId(id));
    teamModels.set({logo_url:`/public/teams/uploads/${req.file.filename}`});
    await teamModels.save();
    const fileUrl = `/public/teams/uploads/${req.file.filename}`;
    return res.status(200).json(new ApiResponse(200,{fileUrl}, "logo uploaded successfully"));
})

const createTeam = asyncHandler(async(req,res)=>{
    const {teamname,
        game,
        players} = extractInput(req,["teamname",
        "game",
        "players",]);

    const role = req.body.role || req.query.role || req.params.role;
    const rank = req.body.rank || req.query.rank || req.params.rank;
    const server = req.body.server || req.query.server || req.params.server;
    let logo;
    const language = req.body.language || req.query.language || req.params.language;

    // Handle logo upload
    if (req.file) {
        console.log("Team logo exists",req.file);
        logo = `/public/teams/uploads/${req.file.filename}`;
    }
    else{
        console.log("Team logo does not exists");
    }

    // Parse players array
    let parsedPlayers = [];

    console.log(players);
    if (players) {
        try {
            parsedPlayers = players.map(id => new mongoose.Types.ObjectId(id));
        } catch (e) {
            return res.status(400).json(new ApiResponse(400, null,"Invalid players format"));
        }
    }

  const user = await UserModel.findOne({email: req.user.email});

  if(!user){
      return res.status(401).json(new ApiResponse(401,{}, "User not found"));
  }
  
  const team =  await TeamModel.create({
        teamname,
        game,
        role,
        rank,
        server,
        logo,
        language,
        players: parsedPlayers,
         owner:new mongoose.Types.ObjectId(user._id)

    });
    if(!team)
    {
        return res.status(500).json(new ApiResponse(500,{}, "Failed to create team"));
    }
    return res.status(200).json(new ApiResponse(200,team, "Team created successfully"));
});
export {getAllTeams,getMyTeam,createTeam,uploadTeamLogo}