import mongoose, {Schema, SchemaType} from "mongoose";

export const otpSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    otp: {
        type: Number,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    }
}, {timestamps: true});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP