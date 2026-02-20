import mongoose from "mongoose";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;
  const user = req.user._id;

  if (req.user.isBlocked) {
    throw new ApiError(403, "you are blocked");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      user,
      "items.product": product,
      orderStatus: "DELIVERED"
    }).session(session);

    if (!order) {
      throw new ApiError(400, "Only users who purchased and received this product can review");
    }

    const existingReview = await Review.findOne({ user, product }).session(session);

    if (existingReview) {
      throw new ApiError(409, "you already reviewed this product");
    }

    const review = await Review.create([{
      user,
      product,
      rating,
      comment
    }], { session });

    const productDocumnet = await Product.findById(product).session(session);

    const newRating = (productDocumnet.rating * productDocumnet.ratingCount + rating) / (productDocumnet.ratingCount + 1);
    productDocumnet.rating = newRating;
    productDocumnet.ratingCount += 1;
    await productDocumnet.save({ session });

    await session.commitTransaction();

    return res.status(201).json(new ApiResponse(201, review, "review sended successfully"));

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
});

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params;

  if (req.user.isBlocked) {
    throw new ApiError(403, "you are blocked");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.findOne({ user: req.user._id, _id: id }).session(session);

    if (!review) {
      throw new ApiError(404, "review not found");
    }

    const product = await Product.findById(review.product).session(session);

    if (!product) {
      throw new ApiError(404, "product not found");
    }

    if (rating) {
      const totalRatingPoints = ((product.rating * product.ratingCount) - review.rating) + rating;
      review.rating = rating;
      product.rating = Math.round((totalRatingPoints / product.ratingCount + Number.EPSILON) * 10) / 10;
      await product.save({ session });
    }

    if (comment) {
      review.comment = comment;
    }

    await review.save({ session });
    await session.commitTransaction();

    return res.status(200).json(new ApiResponse(200, review, "review updated successfully"));

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.isBlocked) {
    throw new ApiError(403, "you are blocked");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.findOne({ user: req.user._id, _id: id }).session(session);

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
    }else{
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
