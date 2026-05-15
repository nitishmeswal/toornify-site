import { Router } from 'express';
import {createTeam, getAllTeams, getMyTeam, uploadTeamLogo} from "../controllers/teams.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamsRoute = Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const filePath = path.join(__dirname, '../public/teams/uploads/');
        if(!fs.existsSync(filePath)){
            fs.mkdirSync(filePath, {recursive: true});
        }
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const safeName = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
        cb(null, safeName )
    }
});

const upload = multer({ storage: storage });

teamsRoute.route('/getTeams').get(getAllTeams);
teamsRoute.route('/fetchUserTeams').get(verifyJWT,getMyTeam);
teamsRoute.route('/createTeam').post(verifyJWT, upload.single('logo'),createTeam); // Missing controller function
teamsRoute.route('/uploadTeamLogo').post(upload.single('team_logo'),uploadTeamLogo);
export default  teamsRoute;