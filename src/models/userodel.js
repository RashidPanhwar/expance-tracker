import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false, // Exclude password from query results by default
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
        default: null,
    },
    provider: {
        type: String,
        enum: ["local", "google", "facebook"],
        default: "local",
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, {timestamps: true});

// userSchema.pre("save", async function (next) {
//     if(!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);

//     next();
// });

// userSchema.methods.comparePassword = async function(password) {
//     return await bcrypt.compare(password, this.password);
// };

const User = mongoose.model("User", userSchema);

export default User;