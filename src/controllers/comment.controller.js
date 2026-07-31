import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const pageNum = Number(req.query.page)
    const limitNum = Number(req.query.limit)
    const skip = (pageNum - 1) * limitNum;


    const comment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNum
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                owner: 1,
                content: 1
            }
        }
    ])
    if (!comment?.length) {
        throw new ApiError(404, "comments do not exists")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, comment, "comments fetched successfully")
        )



})

const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { content } = req.body

    if (!videoId?.trim()) {
        throw new ApiError(400, "videoId is missing")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "you can't post an empty comment")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        new ApiError(400, "Video does not exist")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment posted succesfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "commentId is missing")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "you can't post an empty comment")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: {
                content,
            }
        },
        { new: true })

    res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment updated succesfully")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "commentId is missing")
    }

    await Comment.findOneAndDelete({
            _id: commentId,
            owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
