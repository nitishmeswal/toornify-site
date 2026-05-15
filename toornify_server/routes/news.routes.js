import { Router } from "express";
import { fetchNews } from "../controllers/news.controllers.js";
const newsRouter = Router();

newsRouter.route("/getNews").get(fetchNews);

export default newsRouter;