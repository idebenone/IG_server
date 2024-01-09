import mongoose, { Document, Schema } from 'mongoose';

interface Post extends Document {
    post_type: number,
    user: mongoose.Types.ObjectId,
    img: string,
    video: string,
    caption: string,
    location: string,
    likes_count: number,
    comments_count: number,
    created_at: Date,
    modified_at: Date,
}

const postSchema = new Schema<Post>({
    post_type: { type: Number, default: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    img: { type: String },
    video: { type: String },
    caption: { type: String },
    location: { type: String },
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now }
});

export default mongoose.model<Post>('Post', postSchema);
