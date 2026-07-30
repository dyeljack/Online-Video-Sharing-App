import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    //Get the channel stats like total video views, total subscribers, total videos, total likes.

    const stats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    }
                ],
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: {
                    $size: "$subscribers"
                },
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                totalLikes: {
                    $sum: {
                        $map: {
                            input: "$videos",
                            as: "video",
                            in: {
                                $size: "$$video.likes"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                totalVideos: 1,
                totalSubscribers: 1,
                totalLikes: 1,
                totalViews: 1,
                _id: 0
            }
        }
    ])

    res
        .status(200)
        .json(
            new ApiResponse(200, stats, "stats fetched successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    

    const video = await Video.find({
        owner: req.user._id
    }).select("-owner")

    res
        .status(200)
        .json(
            new ApiResponse(200, video, "channel videos fetched successfully")
        )
})

export {
    getChannelStats,
    getChannelVideos
}