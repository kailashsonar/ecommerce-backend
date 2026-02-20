import mongoose, {Schema} from "mongoose";

const reviewSchema = new Schema({
    product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
},{timestamps: true})

reviewSchema.index({ user: 1, product: 1}, {unique: true});

export const Review = mongoose.model("Review", reviewSchema);