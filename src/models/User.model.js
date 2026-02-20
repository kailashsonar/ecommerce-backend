import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({ 
    username: {
        type : String,
        required : true,
        unique : true,
        index : true,
        trim : true
    },   
    email: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        match : [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    passwordHash: {
        type : String,
        required : true
    },
    refreshTokenHash: {
        type : String,
    },
    tokenVersion: {
        type : Number,
        default : 0
    },
    addresses: [
        {
            fullName: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    role: {
        type : String,
        enum : ["user", "admin"],
        default : "user"
    },
    isBlocked: { 
        type : Boolean,
        default : false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

userSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) {
        return;
    }
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    console.log("passowrd hasing done");
})

userSchema.methods.isPasswordCorrect = async function (passowrd) {
    return await bcrypt.compare(passowrd, this.passwordHash);
}

export const User = mongoose.model("User", userSchema)