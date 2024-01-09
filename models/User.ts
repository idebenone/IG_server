import mongoose, { Document, Schema } from 'mongoose';
interface User extends Document {
    name: string,
    email: string,
    username: string,
    password: string,
    is_verified: boolean,
    otp: number,
    profile_img: string,
    followers_count: number;
    following_count: number;
    posts_count: number,
    created_at: Date,
    modified_at: Date,
}

const userSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    is_verified: { type: Boolean, default: false },
    otp: { type: Number, trim: true },
    profile_img: { type: String },
    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    posts_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now }
});

export default mongoose.model<User>('User', userSchema);
