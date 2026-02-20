import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
  
export const generateAccessToken =  (payload) => {
    try {
        return  jwt.sign(
            {
                _id: payload._id,
                role : payload.role,
                tokenVersion : payload.tokenVersion
            },
            jwtConfig.accessToken.secret,
            {
                expiresIn: jwtConfig.accessToken.expiresIn
            }
        )
    } catch (error) {
        throw new ApiError(500, "something went wrong while tokes creation");
    }
}

export const generateRefreshToken =  (payload) => {
    try {
        return jwt.sign(
            {
                _id: payload._id,
            },
            jwtConfig.refreshToken.secret,
            {
                expiresIn: jwtConfig.refreshToken.expiresIn
            }
        )
    } catch (error) {
        throw new ApiError(500, "something went wrong while tokes creation");
    }
}