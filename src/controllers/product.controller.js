import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
    const { page, category, sizes, minPrice, maxPrice, rating, discount } = req.query;
    const limit = 20;
    const skip = limit * ((page || 1) - 1);
    const filter = {};

    if (category?.length) {
        filter.category = { $in: category };
    }

    if (sizes?.length) {
        filter.sizes = { $in: sizes };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (rating !== undefined) {
        filter.rating = { $gte: rating };
    }

    if (discount !== undefined) {
        filter.discount = { $gte: discount };
    }

    const [products, totalProducts] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v"),
        Product.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200,
        {
            products,
            pagination: {
                page, limit, totalProducts, totalPages: Math.ceil(totalProducts / limit)
            },
        },
        "products fetched successfully")
    );
});

export const searchProduct = asyncHandler(async (req, res) => {
    const { search, page } = req.query;
    const limit = 20;
    const skip = limit * ((page || 1) - 1);

    const filter = { $text: { $search: search } };

    const [products, totalProducts] = await Promise.all([
        Product.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }, createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        products,
        projection: {
            page, limit, totalProducts, totalPages: Math.ceil(totalProducts / limit)
        }
    }));
});

export const relatedProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        sizes: { $in: product.sizes }
    }).limit(20).sort({ rating: -1, totalSold: -1 });

    return res.status(200).json(new ApiResponse(200, relatedProducts, "Related products feched successfully"));
});

export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
        throw new ApiError(404, "product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product feched successfully"));
});

export const getProductReviews = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page } = req.query;
    const limit = 20;
    const skip = limit * (page - 1);

    const productExists = await Product.exists({ _id: id });
    if (!productExists) {
        throw new ApiError(404, "Product not found");
    }

    const [reviews, totalReviews] = await Promise.all([
        Review.find({ product: id }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username -_id").select("-__v"),
        Review.countDocuments({ product: id })
    ]);

    return res.status(200).json(new ApiResponse(200,
        {
            reviews,
            pagination: {
                page, limit, totalReviews, totalPages: Math.ceil(totalReviews / limit)
            }
        },
        "product reviews fetched successfully"
    ));
});