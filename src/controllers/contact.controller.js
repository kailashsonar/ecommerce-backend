import { Contact } from "../models/Contact.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createContact = asyncHandler(async (req, res) => {
    const {name, email, message} = req.body;

    const contact = await Contact.create({
        name,
        email,
        message,
        status: "NEW"
    });

    return res.status(201).json( new ApiResponse(201, contact, "contact created successfully"));
});