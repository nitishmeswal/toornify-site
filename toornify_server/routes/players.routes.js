import { Router } from 'express';
import {players} from "../controllers/players.controllers.js";

const playerRoute = Router();

playerRoute.route('/').get(players);

export default  playerRoute;