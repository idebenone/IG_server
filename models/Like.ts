import mongoose, { Document, Schema } from 'mongoose';
interface Like extends Document {
    user: mongoose.Types.ObjectId,
    post: mongoose.Types.ObjectId,
    post_owner: mongoose.Types.ObjectId,
    created_at: Date
}

const likeSchema = new Schema<Like>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    post_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<Like>('Like', likeSchema);
