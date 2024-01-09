import mongoose, { Document, Schema } from 'mongoose';
interface Comment extends Document {
    user: mongoose.Types.ObjectId,
    post: mongoose.Types.ObjectId,
    parent_comment: mongoose.Types.ObjectId,
    comment: string,
    likes_count: number,
    created_at: Date
}

const commentSchema = new Schema<Comment>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    comment: { type: String, required: true },
    likes_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<Comment>('Comment', commentSchema);
