import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        new ApiError(400, "VideoId not provided")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        new ApiError(404, "video does not exist")
    }
    const like = await Like.findOne({ video: videoId, owner: req.user._id })

    if (like) {
        await like.deleteOne()
    } else {

        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Successfully toggled like on video \'${video.title}\'`)
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        new ApiError(400, "commentId not provided")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        new ApiError(404, "comment does not exist")
    }
    const like = await Like.findOne({ comment: commentId, owner: req.user._id })

    if (like) {
        await like.deleteOne()
    } else {

        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Successfully toggled like on comment \'${comment.content}\'`)
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        new ApiError(400, "tweetId not provided")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        new ApiError(404, "tweet does not exist")
    }
    const like = await Like.findOne({ tweet: tweetId, owner: req.user._id })

    if (like) {
        await like.deleteOne()
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Successfully toggled like on tweet \'${tweet.content}\'`)
        )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos


    const like = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }
    })
    const videoIds = like.map(like => like.video)

    const video = await Video.find({
        _id: {$in: videoIds}
    }).select("-isPublished")

    if (!video) {
        throw new ApiError(404, "no liked videos found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, video, "Liked Videos fetched successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}