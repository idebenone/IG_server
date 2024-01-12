import * as dotenv from "dotenv";
dotenv.config();
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { tokenValidator } from '../middleware/tokenValidator'
import User from '../models/User';
import Post from "../models/Post";
import Notification from "../models/Notifications"
import Follower from "../models/Follower"
import { Types } from "mongoose";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname + Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, originalName);
    }
});
const upload = multer({ storage: storage });
const user = Router();
user.use(tokenValidator);
const validateUserId = (req: Request, res: Response, next: () => void) => {
    const userId = res.locals.user_id;
    if (!userId) return res.status(422).json({ message: "User ID is missing" });
    next();
};

/* GET USER PROFILE */
user.get("/", validateUserId, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(res.locals.user_id)
            .select('-password -otp -__v -is_verified')
            .exec();
        const posts = await Post.find({ user: res.locals.user_id })
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user: user, posts: posts });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

user.get("/profile/:id", validateUserId, async (req: Request, res: Response) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
            .select('-password -otp -__v -is_verified')
            .exec();
        const posts = await Post.find({ user: id })
        const is_following = await Follower.find({ user: res.locals.user_id, follower: id })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let is_following_bol = false;
        if (is_following.length != 0) {
            is_following_bol = true;
        }
        res.status(200).json({ user: user, posts: posts, is_following: is_following_bol });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

user.post("/upload", upload.single('file'), validateUserId, async (req: Request, res: Response) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            res.locals.user_id,
            { profile_img: req.file ? req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename : undefined }
        ).exec();
        res.status(200).json({ message: "User profile picture updated" });
    } catch (error) {
        console.error("Error creating a new post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

/* UPDATE USER PROFILE */
user.post("/", validateUserId, async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    try {
        const updatedUser = await User.findByIdAndUpdate(
            res.locals.user_id,
            { name: name },
            { new: true }
        ).exec();
        res.status(200).json({ message: "User profile updated" });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

/* CREATE A NEW POST */
user.post("/post", upload.single('file'), validateUserId, async (req: Request, res: Response) => {
    const { post_type, caption, location } = req.body;
    const userId = res.locals.user_id;
    try {
        const user: any = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        let newPost;
        if (post_type == 1) {
            newPost = new Post({
                post_type,
                user: user._id,
                caption,
                location,
                img: req.file ? req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename : undefined,
            });
        } else {
            newPost = new Post({
                post_type,
                user: user._id,
                caption,
                location,
                video: req.file ? req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename : undefined
            });
        }
        await newPost.save();
        await User.findByIdAndUpdate(userId, { posts_count: user.posts_count + 1 }).exec()
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating a new post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* GET USER NOTIFICATIONS */
user.get("/notifications", async (req: Request, res: Response) => {
    const id = res.locals.user_id
    try {
        const notifications: any = await Notification.findById({ user: id }).exec();
        notifications.length !== 0
            ? res.status(200).json(notifications)
            : res.status(404).json({ message: "No notifications at the moment!" })
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: "Something went wrong!" })
    }
})

/* FOLLOW A USER */
user.post("/follow/:userId", validateUserId, async (req: Request, res: Response) => {
    const currentUserId = res.locals.user_id;
    const { userId } = req.params;

    try {
        if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });
        if (currentUserId === userId) return res.status(400).json({ message: "Cannot follow yourself" });
        const userObjectId = new Types.ObjectId(userId);
        const currentUser: any = await User.findById(currentUserId);
        const userToFollow: any = await User.findById(userObjectId);
        if (!currentUser || !userToFollow) return res.status(404).json({ message: "User not found" });
        const follower = new Follower({ user: currentUserId, follower: userObjectId });
        await follower.save()
        await User.findByIdAndUpdate(currentUserId, { following_count: currentUser.following_count + 1 }).exec();
        await User.findByIdAndUpdate(userObjectId, { followers_count: userToFollow.followers_count + 1 }).exec();
        res.status(200).json({ message: "Successfully followed user" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

/* UNFOLLOW A USER */
user.post("/unfollow/:userId", validateUserId, async (req: Request, res: Response) => {
    const currentUserId = res.locals.user_id;
    const { userId } = req.params;

    try {
        if (!Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const userObjectId = new Types.ObjectId(userId);
        const currentUser = await User.findById(currentUserId);
        const userToUnfollow = await User.findById(userObjectId);
        if (!currentUser || !userToUnfollow) {
            return res.status(404).json({ message: "User not found" });
        }
        await Follower.findOneAndDelete({ user: currentUserId, follower: userObjectId })
        await User.findByIdAndUpdate(currentUserId, { following_count: currentUser.following_count - 1 }).exec();
        await User.findByIdAndUpdate(userObjectId, { followers_count: userToUnfollow.followers_count - 1 }).exec();
        res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

/*SEARCH USERS */
user.get("/search", validateUserId, async (req: Request, res: Response) => {
    const { query } = req.query;
    try {
        if (typeof query !== 'string' || query.trim() === '') return res.status(400).json({ message: 'Query parameter is missing or empty' });
        const users = await User.find({ username: { $regex: query, $options: 'i' } }).select('-password -otp -__v -is_verified');
        if (users.length === 0) return res.status(404).json({ message: 'No users found' });
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});


export default user;