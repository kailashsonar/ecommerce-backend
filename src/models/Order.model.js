import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    shippingAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["CREATED", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "CREATED"
    },
    totalAmount: { 
        type: Number,  
        required: true
    },
}, {timestamps: true})

orderSchema.index({ "shippingAddress.state": 1, "shippingAddress.city": 1, orderStatus: 1 });
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);