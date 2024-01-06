import mongoose, { Document, Schema } from 'mongoose';
interface Follower extends Document {
    user: mongoose.Types.ObjectId,
    following: mongoose.Types.ObjectId,
    created_at: Date,
}

const followerSchema = new Schema<Follower>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.model<Follower>('Follower', followerSchema);
