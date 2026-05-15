import { Router } from 'express';
import {
    getAllTournaments,
    createTournament,
    getTournamentById,
    registerForTournament, updateVisibility
} from "../controllers/tournaments.controller.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = path.join(__dirname, '../public/data/uploads/');
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safeName)
    }
});

const upload = multer({ storage: storage });

const tournamentRoutes = Router();


tournamentRoutes.route('/getTournaments').get(getAllTournaments);
tournamentRoutes.route('/createTournament').post(verifyJWT, upload.fields([{ name: 'tournamentIcon' }, { name: 'tournamentBanner' }]), createTournament);
tournamentRoutes.route('/getTournamentById/:id').get(getTournamentById);
tournamentRoutes.route('/registerForTournament').post(verifyJWT,registerForTournament);
tournamentRoutes.route('/updateVisibility').post(verifyJWT, updateVisibility);
export default tournamentRoutes;