import mongoose, { Schema } from "mongoose";


const jobApplicationSchema = new Schema({
    interestedInJob: {
        type: String,
        enum: [
            "FRONTEND_DEVELOPER",
            "BACKEND_DEVELOPER",
            "FULLSTACK_DEVELOPER",
            "MOBILE_APP_DEVELOPER",
            "QA_TESTER",
            "UI_UX_DESIGNER",
            "DEVOPS_ENGINEER",
            "INTERN",
            "OTHER"
        ],
        required: true,
        index: true
    },
    otherRole: { type: String },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    currentCity: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: Number, //years
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"],
        default: "NEW"
    }

}, { timestamps: true });

jobApplicationSchema.index({ status: 1 });

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
