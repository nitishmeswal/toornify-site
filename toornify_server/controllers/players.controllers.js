import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiErrorResponse} from "../utils/ApiErrorResponse.js";
import UserModel from "../models/users.models.js";
const players =asyncHandler(async(req,res)=>{

const users = await UserModel.find();
if(!users) {
    {
        res.status(200).json(new ApiResponse(200, [], "No players found"));
    }
}
return res.status(200).json(new ApiResponse(200,users, "Players fetched successfully"));

})


export {players}