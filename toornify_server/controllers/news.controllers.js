import axios from "axios";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorResponse } from "../utils/ApiErrorResponse.js";
const fetchNews = asyncHandler(async(req,res)=>{
    const { query, lang, country, limit = 10, sortBy = "publishedAt" } = req.query;
    const apiKey = 'e5b281bdda6747bdc9d280d97b7d99f0';
    const apiUrl = new URL("https://gnews.io/api/v4/search");
    apiUrl.searchParams.set("q", query);
    apiUrl.searchParams.set("lang", lang);
    apiUrl.searchParams.set("country", country);
    apiUrl.searchParams.set("max", Math.min(limit * 2, 20).toString()); // Fetch more for filtering
    apiUrl.searchParams.set("sortby", sortBy);
    apiUrl.searchParams.set("apikey", apiKey);

    const response = await axios.get(apiUrl.toString());

    if(response.status !== 200){
        throw new ApiErrorResponse(response.status, "Failed to fetch news");
    }
    let articles = response.data.articles || [];

    // Filter articles to match the exact limit requested
    articles = articles.slice(0, limit);

    return res
      .status(200)
      .json(new ApiResponse(200, { articles }, "News fetched successfully!"));

});

export {fetchNews};