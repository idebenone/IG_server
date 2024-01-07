import * as dotenv from "dotenv";
dotenv.config();
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { tokenValidator } from '../middleware/tokenValidator'
import User from '../models/User';
import Post from "../models/Post";
import Notification from "../models/Notifications"
import { Types } from "mongoose";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Destination folder for file storage
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix); // File naming convention
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
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
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
        res.status(200).json({ message: "User profile updated", user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

/* CREATE A NEW POST */
user.post("/", upload.single('file'), validateUserId, async (req: Request, res: Response) => {
    const { post_type, description, location } = req.body;
    const userId = res.locals.user_id;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let newPost;
        if (post_type == 1) {
            newPost = new Post({
                post_type,
                user: user._id,
                description,
                location,
                img: req.file ? req.file.path : undefined,
                video: ""
            });
        } else {
            newPost = new Post({
                post_type,
                user: user._id,
                description,
                location,
                img: "",
                video: req.file ? req.file.path : undefined
            });
        }

        await newPost.save();
        user.posts.push(newPost._id);
        await user.save();

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
        const currentUser = await User.findById(currentUserId);
        const userToFollow = await User.findById(userObjectId);

        if (!currentUser || !userToFollow) return res.status(404).json({ message: "User not found" });
        if (currentUser.following.includes(userObjectId)) return res.status(400).json({ message: "Already following this user" });

        currentUser.following.push(userObjectId);
        userToFollow.followers.push(currentUserId);

        await currentUser.save();
        await userToFollow.save();
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
        if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });

        const userObjectId = new Types.ObjectId(userId);
        const currentUser = await User.findById(currentUserId);
        const userToUnfollow = await User.findById(userObjectId);

        if (!currentUser || !userToUnfollow) return res.status(404).json({ message: "User not found" });
        if (!currentUser.following.includes(userObjectId)) return res.status(400).json({ message: "Not following this user" });

        currentUser.following = currentUser.following.filter(followedUserId => followedUserId !== userObjectId);
        userToUnfollow.followers = userToUnfollow.followers.filter(followerUserId => followerUserId !== currentUserId);

        await currentUser.save();
        await userToUnfollow.save();
        res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default user;