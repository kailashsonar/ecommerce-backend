import { transpoter } from "../config/nodemailer.config.js";
import ApiError from "../utils/ApiError.js";

export const sendMail = async (to, subject, text) => {
    try {
        const response = await transpoter.sendMail({
            from: `"Email Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });

    } catch (error) {
        throw new ApiError(500, "otp cloud not send");
    }
};