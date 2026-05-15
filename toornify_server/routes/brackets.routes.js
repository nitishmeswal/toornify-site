import { Router } from 'express';
import {
    getBracketById,
    getBrackets,
    updateMatch,
    reorderTeams,
    createBracket,
} from "../controllers/brackets.controller.js";
const bracketsRoute = Router();


bracketsRoute.route('/getBrackets').get(getBrackets);
bracketsRoute.route('/getBracketById/:id').get(getBracketById);
bracketsRoute.route('/updateMatch/:bracketId/:matchIndex').patch(updateMatch);
bracketsRoute.route('/reorder/:bracketId').put(reorderTeams);
bracketsRoute.route('/createBracket').post(createBracket)
export default  bracketsRoute;