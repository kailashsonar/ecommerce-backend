import { asyncHandler } from "../utils/asyncHandler.js";
import { JobApplication } from "../models/Jobapplication.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createJobapplication = asyncHandler(async (req, res) => {
    const { interestedInJob, otherRole, name, email, currentCity, experience } = req.body;
    const applicationData = {
        interestedInJob,
        name,
        email,
        currentCity,
        experience
    }

    const applicationExist = await JobApplication.findOne({ email });

    if (applicationExist) {
        throw new ApiError(400, "Application with this email already exist");

    }

    if (otherRole) {
        if (interestedInJob == "OTHER") {
            applicationData.otherRole = otherRole;
        } else {
            throw new ApiError(400, "Select OTHER in interestedInJob if you want to provide otherRole");
        }
    }

    await JobApplication.create(applicationData);

    return res.status(201).json(new ApiResponse(201, {}, "Job application successfully created"));
});