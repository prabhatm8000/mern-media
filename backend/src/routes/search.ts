import express from "express";
import verifyToken from "../middleware/userAuth";
import { searchAutoComplete, searchUser } from "../controllers/search";

const search = express.Router();

search.use(verifyToken)

search.get("/autocomplete", searchAutoComplete)
search.get("/", searchUser)

export default search;