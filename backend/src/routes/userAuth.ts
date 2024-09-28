import express, { Request, Response } from "express";
import { check } from "express-validator";
import { signin, login, logout } from "../controllers/userAuth";
import verifyToken from "../middleware/userAuth";

const userAuth = express.Router();

userAuth.post(
    "/log-in",
    [
        check("username", "Username is required"),
        check("password", "Password must have 6 characters").isLength({
            min: 6,
        }),
    ],
    login
);

userAuth.post(
    "/sign-in",
    [
        check("username", "Username is required"),
        check("email", "Email is required").isEmail().withMessage("Invalid Email"),
        check("password", "Password must have 6 characters").isLength({
            min: 6,
        }),
    ],
    signin
);

userAuth.post("/log-out", logout);

userAuth.get("/validate-token", verifyToken, (req: Request, res: Response) => {
    res.status(200).send({ userId: req.userId });
});

export default userAuth;
