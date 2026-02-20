import { jwtConfig } from "../config/jwt.js";
import { User } from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

 const verifyJwt = asyncHandler( async (req, res, next) => {
    let accessToken;

    if (req.cookies?.accessToken) {
        accessToken = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
        accessToken = req.headers.authorization.split(" ")[1];
    } 

    if (!accessToken) {
        throw new ApiError(401, "Authentication required")
    }

    let decodedData;
    try {
        decodedData = jwt.verify(accessToken, jwtConfig.accessToken.secret);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired tokens");
    }

    const user = await User.findById({_id: decodedData._id});

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (decodedData.tokenVersion !== user.tokenVersion) {
        throw new ApiError(401, "the token version is invaild");
    }

    req.user = {
        _id: user._id,
        role: user.role,
        isBlocked: user.isBlocked
    };

    next();
 });

export default verifyJwt;

