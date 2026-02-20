import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../services/auth.service.js";
import bcrypt from "bcrypt";
import { Otp } from "../models/Opt.model.js";
import crypto from 'crypto';
import { sendMail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const user = await User.create({ username, email, passwordHash: password });

    if (!user) {
        throw new ApiError(500, "user could not be created.")
    }

    return res.status(201).json(new ApiResponse(201, { _id: user._id, username: user.username, email: user.email }, "user successfully created."));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "user not exist please register");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    if (user.isVerified) {
        const accessToken = generateAccessToken({ _id: user._id, role: user.role, tokenVersion: user.tokenVersion });
        const refreshToken = generateRefreshToken({ _id: user._id });

        user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await user.save({ validateBeforeSave: false });

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }

        return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(200, { _id: user._id, username: user.username, email: user.email }, "successfully logged in"));
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    
    await Otp.findOneAndDelete({ email, purpose: "LOGIN" });

    await Otp.create({
        email,
        otpHash: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        purpose: "LOGIN"
    });

    await sendMail(
        email,
        "your otp code",
        `your otp code : ${otp}. this otp is valid for 5 minutes`
    );
    return res.status(200).json(new ApiResponse(200, { "otpRequired": true, "message": `OTP sent to your email : ${email}` }, `OTP sent to your email : ${email}`));
});

export const otpCheck = asyncHandler( async (req, res) => {
    const { otp, email } = req.body;
    
    const otpData = await Otp.findOne({email});

    if (!otpData) {
        throw new ApiError(400, "OTP expired or not found. Please login again.");
    }

    if (otpData.attempts >= 5) {
        await Otp.findOneAndDelete({ email, purpose: "LOGIN" });
        throw new ApiError(400, "OTP attempts exceeded. Please try again.");
    }

    const isOtpCorrect = await otpData.isOtpCorrect(otp);
    if (!isOtpCorrect) {
        otpData.attempts += 1;
        await otpData.save({validateBeforeSave: false});

        throw new ApiError(400, "invaild otp please try again");
    }

    await Otp.findOneAndDelete({ email, purpose: "LOGIN" });

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = generateAccessToken({ _id: user._id, role: user.role, tokenVersion: user.tokenVersion });
    const refreshToken = generateRefreshToken({ _id: user._id });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(200, { _id: user._id, username: user.username, email: user.email }, "successfully logged in"));
} );

export const resendOtp = asyncHandler( async (req, res) => {
    const { email } = req.body;

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
        throw new ApiError(400, "otp is expired or not found please login again");
    }

    if (Date.now() - otpData.lastSentAt.getTime() < 30_000) {
        throw new ApiError(429, "Please wait before resending OTP");
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpData.otpHash = otp;
    otpData.attempts = 0;
    otpData.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpData.lastSentAt = Date.now();

    await otpData.save({validateBeforeSave: false});

    await sendMail(
        email,
        "your otp code",
        `your otp code : ${otp}. this otp is valid for 5 minutes`
    )

    return res.status(200).json(new ApiResponse(200, { "otpRequired": true, "message": `OTP is resent to your email : ${email}` }, `New OTP sent to your email : ${email}`));
} );

export const logout = asyncHandler(async (req, res) => {

    const user = await User.findOneAndUpdate(
        { _id: req?.user?._id },
        {
            $set: {
                refreshTokenHash: null,
                isVerified: false
            },
            $inc: {
                tokenVersion: 1
            }
        },
        {
            new: true
        }
    );

    if (!user) {
        throw new ApiError(401, "user not found");
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res.status(200).clearCookie("accessToken", cookieOptions).clearCookie("refreshToken", cookieOptions).json(new ApiResponse(200, [], "successfully logout"));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById({ _id: req?.user?._id });

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "password is incorrect please enter vaild password");
    }

    user.passwordHash = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "password changed successfully"));
});


export const forgotPassword = asyncHandler( async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({email});

    if (!user) {
        return res.status(200).json( new ApiResponse(200, { otpRequired: true }, "If the email exists, an OTP has been sent"));
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    await Otp.findOneAndDelete({email, purpose: "FORGOT_PASSWORD"});

    await Otp.create({
        otpHash: otp,
        email,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        purpose: "FORGOT_PASSWORD"
    });

    await sendMail(
        email,
        "Reset Your Password",
        `your otp code : ${otp}. this otp is valid for 5 minutes`
    );

    return res.status(200).json(new ApiResponse(200, { "otpRequired": true, email}, "If the email exists, an OTP has been sent"));
} );

export const forgotPasswordResendOtp = asyncHandler( async (req, res) => {
    const { email } = req.body;

    const otpData = await Otp.findOne({ email, purpose: "FORGOT_PASSWORD" });

    if (!otpData) {
        return res.status(200).json( new ApiResponse( 200, { otpRequired: true }, "If the email exists, a new OTP has been sent" ) );
    }

    if (otpData.lastSentAt && Date.now() - otpData.lastSentAt.getTime() < 30_000) { 
        throw new ApiError(429, "Please wait before resending OTP");
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpData.otpHash = otp;
    otpData.attempts = 0;
    otpData.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpData.lastSentAt = new Date();;

    await otpData.save({validateBeforeSave: false});

    await sendMail(
        email,
        "Reset Your Password",
        `your otp code : ${otp}. this otp is valid for 5 minutes`
    );

    return res.status(200).json( new ApiResponse(200, { "otpRequired": true }, `New OTP sent to your email : ${email}`));
} );

export const resetPassword = asyncHandler( async (req, res) => {
    const { otp, email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "Invalid OTP or email");
    }

    const otpData = await Otp.findOne({ email, purpose: "FORGOT_PASSWORD" });

    if (!otpData) {
        throw new ApiError(400, "OTP expired or not found. Please login again.");
    }

    if (otpData.attempts >= 5) {
        await Otp.findOneAndDelete({ email, purpose: "FORGOT_PASSWORD" });
        throw new ApiError(400, "OTP attempts exceeded. Please try again.");
    }

    const isOtpCorrect = await otpData.isOtpCorrect(otp);
    if (!isOtpCorrect) {
        otpData.attempts += 1;
        await otpData.save({validateBeforeSave: false});

        throw new ApiError(400, "invaild otp please try again");
    }

    await Otp.findOneAndDelete({ email, purpose: "FORGOT_PASSWORD" });

    user.passwordHash = newPassword;
    user.refreshTokenHash = null;
    user.tokenVersion += 1;
    await user.save({validateBeforeSave: false});

    return res.status(200).json( new ApiResponse(200, { }, "successfully password changed" ));
} );


export const refreshJwtTokens = asyncHandler( async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Authentication required");
    }

    let decodedData;
    try {
        decodedData = jwt.verify(refreshToken, jwtConfig.refreshToken.secret);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired tokens");
    }

    const user = await User.findById({_id: decodedData._id});

     if (!user || !user.refreshTokenHash) {
        throw new ApiError(401, "Session expired. Please login again.");
    }
    
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
        user.refreshTokenHash = null;
        user.tokenVersion += 1;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(401 ,"Session expired. Please login again.");
    }

    const newAccessToken = generateAccessToken({ _id: user._id, role: user.role, tokenVersion: user.tokenVersion });
    const newRefreshToken = generateRefreshToken({ _id: user._id });

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res.status(200).cookie("accessToken", newAccessToken, cookieOptions).cookie("refreshToken", newRefreshToken, cookieOptions).json(new ApiResponse(200, { }, "successfully tokens are updated"));
} );