import { Router } from 'express';
import {getAllGames, getGameById} from "../controllers/games.controllers.js";
const gamesRoute = Router();


gamesRoute.route('/getGames').get(getAllGames);
gamesRoute.route('/getGameById').post(getGameById);

export default  gamesRoute;