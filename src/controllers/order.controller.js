import mongoose from "mongoose";
import { Cart } from "../models/Cart.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";

export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, onDefaultAddress } = req.body;

    if (req.user.isBlocked) {
        throw new ApiError(403, "You are blocked");
    }

    let userDefaultAddress
    if (onDefaultAddress) {
        userDefaultAddress = await User.findOne({ _id: req.user._id, "addresses.isDefault": true }, { "addresses.$": 1, _id: 0 }).lean();
        if (!userDefaultAddress) {
            throw new ApiError(404, "default shipping address not found");
        }
    }

    const finalShippingAddress = onDefaultAddress ? userDefaultAddress.addresses[0] : shippingAddress;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const cart = await Cart.findOne({ user: req.user._id }).session(session);

        if (!cart) {
            throw new ApiError(404, "cart is not found");
        }
        if (!(cart.items.length > 0)) {
            throw new ApiError(404, "cart is empty");
        }

        const productQtyMap = {};
        for (const item of cart.items) {
            const productId = item.product.toString();
            productQtyMap[productId] = (productQtyMap[productId] || 0) + item.quantity;
        }

        for (const [productId, totalQty] of Object.entries(productQtyMap)) {
            const product = await Product.findById(productId).session(session);

            if (!product || product.stock < totalQty) {
                throw new ApiError(409, `Insufficient stock for product ${product?.name || ""}`
                );
            }
        }

        let totalAmount = 0;
        const cartItems = [];
        for (const item of cart.items) {
            const product = await Product.findOne({ _id: item.product, sizes: item.size, "colors.name": item.color }).session(session);

            const finalPrice = product.discount > 0 ? product.price - (((product.price * product.discount) / 100)) : product.price;

            cartItems.push({
                product: product._id,
                name: product.name,
                image: product.image.url,
                price: finalPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            })
            totalAmount += finalPrice * item.quantity;
        }

        const order = await Order.create([{
            user: req.user._id,
            items: cartItems,
            shippingAddress: finalShippingAddress,
            paymentMethod,
            orderStatus: paymentMethod == "COD" ? "CREATED" : "PAID",
            totalAmount
        }], { session });

        for (const [productId, totalQty] of Object.entries(productQtyMap)) {
            await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        stock: -totalQty,
                        totalSold: totalQty
                    }
                },
                { session }
            );
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save({ session });

        await session.commitTransaction();

        return res.status(201).json(new ApiResponse(201, order, "order successfully created"));

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const page = req.query.page;
    const limit = 20;
    const skip = 20 * ((page || 1) - 1);

    if (req.user.isBlocked) {
        throw new ApiError(403, "You are blocked");
    }

    const [orders, totalOrders] = await Promise.all([
        Order.find({ user: req?.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v"),
        Order.countDocuments({ user: req?.user._id })
    ]);

    return res.status(200).json(new ApiResponse(200, {
        orders,
        pagination: { page, limit, totalOrders, totalPages: Math.ceil(totalOrders / limit) }
    }, "orders fetched successfully"));
});

export const getOrder = asyncHandler(async (req, res) => {
    if (req.user.isBlocked) {
        throw new ApiError(403, "You are blocked");
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(new ApiResponse(200, order || {}, "order fetched successfully"))
});

export const cancelOrder = asyncHandler(async (req, res) => {
    if (req.user.isBlocked) {
        throw new ApiError(403, "You are blocked");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).session(session);

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (["DELIVERED", "SHIPPED"].includes(order.orderStatus)) {
            throw new ApiError(409, `you are not allowed to cancel this order due to order is ${order.orderStatus}`);
        }

        if (order.orderStatus == "CANCELLED") {
            throw new ApiError(400, "Order is already CANCELLED");
        }

        for (item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity,
                        totalSold: -item.quantity
                    }
                },
                { session }
            )
        }

        order.orderStatus = "CANCELLED";
        await order.save({ session });

        await session.commitTransaction();

        return res.status(200).json(new ApiResponse(200, order || {}, "order is cancelled  successfully"))
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});