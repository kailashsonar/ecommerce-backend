import mongoose, {Schema} from "mongoose";

const productSchema = new Schema({
    name: {
        type : String,
        required : true,
        trim : true,
    },
    description: {
        type : String,
        required : true,
        trim : true,
        maxLength: 1000
    },  
    image: {
        type : {
            url: { type : String, required: true },
            publicId: { type : String, required: true }
        },
        required : true
    },
    price: {
        type: Number,
        required: true,
        min: 0 
    },
    discount: { 
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: Number,
        default: 1,
        min: 1
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    colors: {
        type : [
            {
                name: { type: String, required : true},
                hexCode: { type: String, required : true}
            }
        ],
        required : true,
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one color is required']
    },
    sizes: {
        type : [String],
        required: true,
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one size is required']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    totalSold: {
        type: Number,
        default: 0
    }

}, {timestamps: true})
    
productSchema.index({ name: "text", description: "text" });

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
 
export const Product = mongoose.model("Product", productSchema);