import mongoose, { Document, Schema } from 'mongoose';
interface Notification extends Document {
    user: mongoose.Types.ObjectId,
    type: number,
    following_id: string,
    follower_id: string,
    post_id: string,
    comment_id: string,
    likes: number,
    is_read: boolean,
    created_at: Date,
    modified_at: Date,
}

const notificationSchema = new Schema<Notification>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: Number, required: true },
    following_id: { type: String },
    follower_id: { type: String },
    post_id: { type: String },
    comment_id: { type: String },
    likes: { type: Number, default: 0 },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now },
});

export default mongoose.model<Notification>('Notification', notificationSchema);
