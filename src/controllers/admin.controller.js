import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import handleCloudinaryUpload from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
import { Order } from "../models/Order.model.js";
import mongoose from "mongoose";
import { Review } from "../models/Review.model.js";
import { Contact } from "../models/Contact.model.js";
import { JobApplication } from "../models/Jobapplication.model.js";

export const getUsers = asyncHandler(async (req, res) => {
    const { page, username } = req.query;
    const limit = 20;
    const skip = 20 * (page - 1);
    const search = {};

    if (username?.trim()) {
        search.username = {
            $regex: username.trim(),
            $options: "i"
        };
    }

    const [users, totalUsers] = await Promise.all([
        User.find(search).select("-refreshTokenHash -passwordHash -tokenVersion").sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(search)
    ]);

    return res.status(200).json(new ApiResponse(200,
        {
            users,
            pagination: { page, limit, totalUsers, totalPages: Math.ceil(totalUsers / limit) }
        },
        "users feched successfully"
    ));
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
    const id = req?.params.id;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { isBlocked: user.isBlocked }, `user successfully ${user.isBlocked ? "blocked" : "unblocked"}`));
});

export const getProducts = asyncHandler(async (req, res) => {
    const { page, name } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);
    let search = {};
    let projection = {};
    let sort = { createdAt: -1 };

    if (name?.trim()) {
        search = { $text: { $search: name.trim() } };
        projection = { score: { $meta: "textScore" } };
        sort = { score: { $meta: "textScore" } };
    }

    const [products, totalProducts] = await Promise.all([
        Product.find(search, projection).select().sort(sort).skip(skip).limit(limit),
        Product.countDocuments(search)
    ]);

    return res.status(200).json(new ApiResponse(200,
        {
            products,
            pagination: { page, limit, totalProducts, totalPages: Math.ceil(totalProducts / limit) }
        },
        "products feched successfully"
    ));
});

export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, discount, stock, category, sizes, colors } = req.body;

    if (!req.file) {
        throw new ApiError(400, "image is required");
    }

    const categoryData = await Category.findById(category);
    if (!categoryData) {
        throw new ApiError(400, "category not found please first add category first");
    }

    const productExists = await Product.findOne({ name })
    if (productExists) {
        throw new ApiError(409, "product already exists");
    }

    const imageData = await handleCloudinaryUpload(req.file.buffer);

    const product = await Product.create({
        name,
        description,
        price,
        discount,
        isOnSale: discount > 0,
        stock,
        category,
        sizes,
        colors,
        image: {
            url: imageData.url,
            publicId: imageData.public_id
        }
    });

    return res.status(201).json(new ApiResponse(201, product, "product successfully created"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(400, "product not exists");
    }

    if (product.image?.publicId) {
        await cloudinary.uploader.destroy(product.image.publicId);
    }

    await product.deleteOne();

    return res.status(200).json(new ApiResponse(200, product, "product deleted successfully"));
});

export const updateStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
        id,
        {
            stock,
        },
        {
            new: true
        }
    );

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "product stock is updated successfully"));
});

export const updateDiscount = asyncHandler(async (req, res) => {
    const { discount } = req.body;
    const { id } = req.params;
    const isOnSale = discount > 0;

    const product = await Product.findByIdAndUpdate(
        id,
        {
            discount,
            isOnSale
        },
        {
            new: true
        }
    );

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "discount is updated successfully"));
});

export const updateBestseller = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    product.isBestSeller = !product.isBestSeller;
    await product.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, product, `product is ${product.isBestSeller ? "marked" : "removed"} in bestseller successfully`));
});

export const updateProductDetails = asyncHandler(async (req, res) => {
    const updateData = req.body;
    const { id } = req.params;

    if (typeof updateData.discount === "number") {
        updateData.isOnSale = updateData.discount > 0;
    }

    const product = await Product.findByIdAndUpdate(
        id,
        {
            $set: updateData
        },
        {
            new: true
        }
    );

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "product updated successfully"));
});

export const updateProductImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        throw new ApiError(400, "image is required");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    if (product.image?.publicId) {
        await cloudinary.uploader.destroy(product.image.publicId);
    }

    const imageData = await handleCloudinaryUpload(req.file.buffer);

    product.image.url = imageData.url;
    product.image.publicId = imageData.public_id;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, product, "product image updated successfully"));
});

export const getOrders = asyncHandler(async (req, res) => {
    const { page, orderStatus, city, state } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);
    const filter = {};

    if (orderStatus) {
        filter.orderStatus = orderStatus;
    }
    if (city) {
        filter["shippingAddress.city"] = { $regex: `^${city}$`, $options: "i" };
    }
    if (state) {
        filter["shippingAddress.state"] = { $regex: `^${state}$`, $options: "i" };
    }

    const [orders, totalOrders] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username email").select("-__v"),
        Order.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        orders,
        pagination: { page, limit, totalOrders, totalPages: Math.ceil(totalOrders / limit) }
    }, "orders fetched successfully"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { orderStatus: newStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const ORDER_STATUS_FLOW = {
        CREATED: ["CONFIRMED", "CANCELLED"],
        PAID: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: []
    };

    const allowedNextStatuses = ORDER_STATUS_FLOW[order.orderStatus] || [];

    if (!allowedNextStatuses.includes(newStatus)) {
        throw new ApiError(409, `Invalid status transition from ${order.orderStatus} to ${newStatus}`);
    }

    order.orderStatus = newStatus;
    await order.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, order, `order status:${order.orderStatus} is updated successfully`));
});

export const updateOrderStatusToDeliver = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "order not found");
    }

    if (order.orderStatus === "DELIVERED") {
        throw new ApiError(409, "order status is already updated to delivered");
    }

    if (order.orderStatus !== "SHIPPED") {
        throw new ApiError(409, `can not be updated order status from ${order.orderStatus} to delivered`);
    }

    order.orderStatus = "DELIVERED";
    await order.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, order, "order status updated to delivered successfully"));
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const review = await Review.findById(id).session(session);

        if (!review) {
            throw new ApiError(404, "review not found");
        }

        const product = await Product.findById(review.product).session(session);

        if (!product) {
            throw new ApiError(404, "product not found");
        }

        if (product.ratingCount > 1) {
            const totalRatingPoints = (product.rating * product.ratingCount) - review.rating;
            product.ratingCount -= 1;
            product.rating = Math.round((totalRatingPoints / product.ratingCount + Number.EPSILON) * 10) / 10;
        } else {
            product.ratingCount = 0;
            product.rating = 0
        }

        await review.deleteOne({ session });
        await product.save({ session });

        await session.commitTransaction();

        return res.status(200).json(new ApiResponse(200, {}, "review deleted successfully"));
    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        session.endSession();
    }
});

export const getReviews = asyncHandler(async (req, res) => {
    const { page, product } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);
    const filter = {};

    if (product) {
        const products = await Product.find({ $text: { $search: product } }, { _id: 1 });
        const productIds = products.map(p => p._id);
        if (productIds.length > 0) {
            filter.product = { $in: products };
        } else {
            return res.status(200).json(new ApiResponse(200, { reviews: [], pagination: { page, limit, totalReviews: 0, totalPages: 0 } }, "reviews fetched successfully"));
        }
    }

    const [reviews, totalReviews] = await Promise.all([
        Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username email").populate("product", "name").select("-__v"),
        Review.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        reviews,
        pagination: { page, limit, totalReviews, totalPages: Math.ceil(totalReviews / limit) }
    }, "reviews fetched successfully"));
});

export const getContacts = asyncHandler(async (req, res) => {
    const { page, status } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);
    const filter = {};

    if (status) {
        filter.status = status;
    }

    const [contacts, totalContacts] = await Promise.all([
        Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v"),
        Contact.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        contacts,
        pagination: { page, limit, totalContacts, totalPages: Math.ceil(totalContacts / limit) }
    }, "contacts fetched successfully"));
});

export const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
        throw new ApiError(404, "contact not found")
    }

    return res.status(200).json(new ApiResponse(200, {}, "contact deleted successfully"));
});

export const updateContactStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
        id,
        {
            $set: {
                status: status
            }
        },
        {
            new: true
        }
    );

    if (!contact) {
        throw new ApiError(404, "contact not found")
    }

    return res.status(200).json(new ApiResponse(200, contact, "contact status updated successfully"));
});

export const getDashboard = asyncHandler(async (req, res) => {

    const [totalUsers, totalOrders, pendingOrders, totalProducts, revenue] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({
            orderStatus: {
                $nin: ["DELIVERED", "CANCELLED"]
            }
        }),
        Product.countDocuments(),
        Order.aggregate([
            {
                $match: {
                    orderStatus: {
                        $ne: "CANCELLED"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ])
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

    return res.status(200).json(new ApiResponse(200, { totalUsers, totalOrders, pendingOrders, totalProducts, totalRevenue }, "data fetched successfully"));
});

export const getAnalyticsSales = asyncHandler(async (req, res) => {

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const resultData = await Order.aggregate([
        {
            $match: {
                orderStatus: { $ne: "CANCELLED" },
                createdAt: { $gte: twelveMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                totalRevenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                totalRevenue: 1,
                orders: 1
            }
        },
        {
            $sort: { "year": 1, "month": 1 }
        },
    ]);


    return res.status(200).json(new ApiResponse(200, resultData, "data fetched successfully"));
});

export const getAnalyticsProducts = asyncHandler(async (req, res) => {

    const products = await Product.find().sort({ totalSold: -1 }).limit(10);

    return res.status(200).json(new ApiResponse(200, products, "products fetched successfully"));
});

export const updateJobApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const jobApplication = await JobApplication.findByIdAndUpdate(
        id,
        {
            $set: {
                status: status
            }
        },
        {
            new: true
        }
    );

    if (!jobApplication) {
        throw new ApiError(404, "job application not found")
    }

    return res.status(200).json(new ApiResponse(200, jobApplication, "job application status updated successfully"));
});

export const deleteJobApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const jobAppication = await JobApplication.findByIdAndDelete(id);

    if (!jobAppication) {
        throw new ApiError(404, "Job appication not found")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Job appication deleted successfully"));
});


export const getJobApplication = asyncHandler(async (req, res) => {
    const { page, status } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);
    const filter = {};

    if (status) {
        filter.status = status;
    }

    const [jobApplications, totalJobApplications] = await Promise.all([
        JobApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v"),
        JobApplication.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        jobApplications,
        pagination: { page, limit, totalJobApplications, totalPages: Math.ceil(totalJobApplications / limit) }
    }, "Job applications fetched successfully"));
});