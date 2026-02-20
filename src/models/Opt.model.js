import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
const otpSchema = new Schema({
    otpHash : {
        type : String,
        required : true
    },
    expiresAt : {
        type : Date,
        required : true
    },
    email : {
        type : String,
        required : true,
        index : true,
        lowercase: true
    },
    attempts : {
        type : Number,
        default : 0,
        max: 5
    },
    lastSentAt: {
        type: Date,
        default: new Date()
    },
    purpose: {
        type: String,
        enum: ["LOGIN", "FORGOT_PASSWORD"],
        required: true
    }
},{timestamps : true});

otpSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

otpSchema.pre("save", async function() {
    if (!this.isModified("otpHash")) {
            return;
        }
        this.otpHash = await bcrypt.hash(this.otpHash, 10);
});   

otpSchema.methods.isOtpCorrect = async function(otp) {
    return await bcrypt.compare(otp, this.otpHash);
}

export const Otp = mongoose.model("Otp", otpSchema);