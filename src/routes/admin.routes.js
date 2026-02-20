import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { createProduct, deleteContact, deleteJobApplication, deleteProduct, deleteReview, getAnalyticsProducts, getAnalyticsSales, getContacts, getDashboard, getJobApplication, getOrders, getProducts, getReviews, getUsers, toggleBlockUser, updateBestseller, updateContactStatus, updateDiscount, updateJobApplicationStatus, updateOrderStatus, updateOrderStatusToDeliver, updateProductDetails, updateProductImage, updateStock } from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createProductSchema, discountSchema, getOrdersSchema, idValidationSchema, stockSchema, updateOrderStatusSchema, updateProductSchema, getContactsSchema, updateContactStatusSchema, getUserSchema, getProductsSchema, getReviewsSchema, updateJobApplicationStatusSchema, jobApplicationSchema } from "../validations/admin.validation.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/users", verifyJwt, isAdmin, validate(getUserSchema), getUsers);

router.patch("/users/:id/block", verifyJwt, isAdmin, validate(idValidationSchema), toggleBlockUser);

router.post("/product", verifyJwt, isAdmin, upload.single("image"), validate(createProductSchema), createProduct);

router.delete("/product/:id", verifyJwt, isAdmin, validate(idValidationSchema), deleteProduct);

router.patch("/products/:id/stock", verifyJwt, isAdmin, validate(idValidationSchema), validate(stockSchema), updateStock);

router.patch("/products/:id/discount", verifyJwt, isAdmin, validate(idValidationSchema), validate(discountSchema), updateDiscount);

router.patch("/products/:id/best-seller", verifyJwt, isAdmin, validate(idValidationSchema), updateBestseller);

router.patch("/product/:id", verifyJwt, isAdmin, validate(idValidationSchema), validate(updateProductSchema), updateProductDetails);

router.patch("/product/:id/image", verifyJwt, isAdmin, validate(idValidationSchema), upload.single("image"), updateProductImage);

router.get("/products", verifyJwt, isAdmin, validate(getProductsSchema), getProducts);

router.get("/orders", verifyJwt, isAdmin, validate(getOrdersSchema), getOrders);

router.patch("/orders/:id/status", verifyJwt, isAdmin, validate(idValidationSchema), validate(updateOrderStatusSchema), updateOrderStatus);

router.patch("/orders/:id/deliver", verifyJwt, isAdmin, validate(idValidationSchema), updateOrderStatusToDeliver);

router.get("/reviews", verifyJwt, isAdmin, validate(getReviewsSchema), getReviews);

router.delete("/reviews/:id", verifyJwt, isAdmin, validate(idValidationSchema), deleteReview);
 
router.get("/contacts", verifyJwt, isAdmin, validate(getContactsSchema), getContacts);

router.patch("/contacts/:id/status", verifyJwt, isAdmin, validate(idValidationSchema), validate(updateContactStatusSchema), updateContactStatus);

router.delete("/contacts/:id", verifyJwt, isAdmin, validate(idValidationSchema), deleteContact);

router.get("/dashboard", verifyJwt, isAdmin, getDashboard);

router.get("/analytics/products", verifyJwt, isAdmin, getAnalyticsProducts);

router.get("/analytics/sales", verifyJwt, isAdmin, getAnalyticsSales);

router.patch("/jobapplication/:id", verifyJwt, isAdmin, validate(idValidationSchema), validate(updateJobApplicationStatusSchema), updateJobApplicationStatus);

router.delete("/jobapplication/:id", verifyJwt, isAdmin, validate(idValidationSchema), deleteJobApplication);

router.get("/jobapplication", verifyJwt, isAdmin, validate(jobApplicationSchema), getJobApplication);

 
export default router;