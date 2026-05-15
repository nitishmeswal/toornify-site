import {asyncHandler} from "../utils/asyncHandler.js";
import GamesModels from "../models/games.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {extractInput} from "../utils/helper.js";

const getAllGames = asyncHandler(async(req,res)=>{

    const games = await GamesModels.aggregate([

        {$match:{}}
    ]);
    if(!games) return res.status(200).json(new ApiResponse(200,null, "No games found"));
    return res.status(200).json(new ApiResponse(200, games, "Games fetched successfully"));
})
const getGameById = asyncHandler(async(req,res)=>{
    const {gameId}= extractInput(req,['gameId']);

    const game = await GamesModels.find({_id:gameId});
    if(!game) return res.status(200).json(new ApiResponse(200,null, "Game not found"));
    return res.status(200).json(new ApiResponse(200, game, "Game fetched successfully"));
})

export {getAllGames,getGameById};