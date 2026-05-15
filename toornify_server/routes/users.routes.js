import { Router } from "express";
import {
    updateAddress,
    updateProfile,
    userDetails,
    updateUserRole,
    getUserRoles,
    getUserById
} from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = path.join(__dirname, '../public/data/uploads/');
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

const userRouter = Router();

userRouter.route("/update-address").post(verifyJWT, updateAddress);
userRouter.route("/user-details").post(verifyJWT, userDetails);
userRouter.route("/update-profile").post(verifyJWT, upload.fields([{name: 'profilePic'}, {name: 'bannerPic'}, {name: 'logo'}]), updateProfile);
userRouter.route("/update-role").post(verifyJWT, updateUserRole);
userRouter.route("/roles").get(getUserRoles);
userRouter.route('/user-by-id/:userId').get(getUserById);
export default userRouter;
