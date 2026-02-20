import { Cart } from "../models/Cart.model.js";
import { Product } from "../models/Product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req?.user._id }).populate("items.product", "name image price color size");

    if (!cart) {
        cart = await Cart.create({
            user: req?.user._id, items: [], totalAmount: 0
        });
    }

    if (cart.items.length > 0) {
        for (const item of cart.items) {
            const product = await Product.findById(item.product)

            if (product.discount > 0) {
                item.price = (product.price * item.quantity);
            } else {
                item.price = (product.price - (((product.price * product.discount) / 100)) * item.quantity);
            }
        }
        await cart.save({ validateBeforeSave: false });
    }

    return res.status(200).json(new ApiResponse(200, cart, "cart fetched successfully"));
});

export const addToCart = asyncHandler(async (req, res) => {
    const { product, quantity, size, color } = req.body;

    if (req.user.isBlocked) {
        throw new ApiError(403, "Your account is blocked");
    }

    const productData = await Product.findOne({ _id: product, sizes: size, "colors.name": color });
    if (!productData) {
        throw new ApiError(404, "Product not found");
    }

    if (productData.stock < quantity) {
        throw new ApiError(400, "Not enough stock");
    }

    let cart = await Cart.findOne({ user: req?.user._id });
    if (!cart) {
        cart = await Cart.create({
            user: req?.user._id, items: [], totalAmount: 0
        });
    }

    const existingItem = cart.items.find(
        item =>
            item.product.toString() === productData._id.toString() && item.size === size && item.color === color
    );

    if (existingItem) {
        throw new ApiError(400, "Product already exist in cart");
    }

    let productPrice = productData.price;
    if (productData.discount > 0) {
        productPrice = productData.price - (productData.price * productData.discount / 100);
    }

    cart.items.push({
        product: productData._id,
        name: productData.name,
        image: productData.image.url,
        price: productPrice,
        quantity,
        size,
        color: color
    });

    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, cart, "item added successfully"));
});

export const updateCart = asyncHandler(async (req, res) => {
    const { action, size, color } = req.body;
    const { id } = req.params;

    if (req.user.isBlocked) {
        throw new ApiError(403, "Your account is blocked");
    }

    const cart = await Cart.findOne({ user: req?.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = await cart.items.find((item) => (item.product.toString() == id && item.size == size && item.color == color));
    if (!item) {
        throw new ApiError(404, "Cart item not found");
    }

    if (action == "INCREMENT") {
        const product = await Product.findById(id);

        if (!product || product.stock < item.quantity + 1) {
            throw new ApiError(400, "Not enough stock");
        }

        item.quantity += 1;
    } else {
        if (item.quantity > 1) {
            item.quantity -= 1;
        }
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, cart, `item is ${action}ED successfully`));
});

export const removeCartItem = asyncHandler(async (req, res) => {
    const { size, color } = req.body;
    const { id } = req.params;

    if (req.user.isBlocked) {
        throw new ApiError(403, "Your account is blocked");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter( item => !( item.product.toString() === id && item.size === size && item.color === color ) );

    if (cart.items.length === initialLength) {
        throw new ApiError(404, "Cart item not found");
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, cart, "item removed successfully"));
});

export const clearCart = asyncHandler( async(req, res) => {
    if (req?.user.isBlocked) {
        throw new ApiError(403, "Your account is blocked")
    }

    const cart = await Cart.findOne({user: req?.user._id});

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({validateBeforeSave: false});

    return res.status(200).json( new ApiResponse(200, cart, "cart is cleared successfully"));
});