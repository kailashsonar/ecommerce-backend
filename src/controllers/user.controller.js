import { User } from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-passwordHash -refreshTokenHash -tokenVersion").lean();
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "successfully data feched"));
});

export const updateUserName = asyncHandler(async (req, res) => {
    const { username } = req.body;

    const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });

    if (existingUser) {
        throw new ApiError(409, "Username already taken");
    }

    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
            $set: {
                username
            }
        },
        {
            new: true
        }
    ).select("-passwordHash -refreshTokenHash -tokenVersion");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Username updated successfully"));
});

export const addAddress = asyncHandler(async (req, res) => {
    const { fullName, phone, street, city, state, pincode } = req.body;

    const user = await User.findById(req?.user._id);

    if (user.addresses.length >= 5) {
        throw new ApiError(400, "Maximum 5 addresses allowed");
    }

    user.addresses.push({ fullName, phone, street, city, state, pincode, isDefault: user.addresses.length === 0 });

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user.addresses, "address successfully added"));
});

export const addressDelete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await User.updateOne(
    { _id: req.user._id, "addresses._id": id },
    { $pull: { addresses: { _id: id } } }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(404, "Address not found or already deleted");
  }

  const user = await User.findById(req.user._id).select("addresses");

  return res.status(200).json(
    new ApiResponse(200, user.addresses, "Address successfully removed")
  );
});

