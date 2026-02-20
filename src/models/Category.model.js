import mongoose, {Schema} from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

export const Category = mongoose.model("Category", categorySchema);
