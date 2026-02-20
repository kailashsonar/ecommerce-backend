import mongoose, { Schema} from "mongoose";

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },
    items: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: String,
                image: String,
                price: {
                    type: Number,
                    min: 0
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                size: String,
                color: String
            }
        ],
        required: true
    },
    totalAmount: {
        type: Number,
        min: 0,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "LOCKED"],
        default: "ACTIVE"
    }  
}, {timestamps: true})

export const Cart = mongoose.model("Cart", cartSchema);