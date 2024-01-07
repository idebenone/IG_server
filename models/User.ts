import mongoose, { Document, Schema } from 'mongoose';
interface User extends Document {
    name: string,
    email: string,
    username: string,
    password: string,
    is_verified: boolean,
    otp: number,
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[],
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
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now }
});

export default mongoose.model<User>('User', userSchema);
