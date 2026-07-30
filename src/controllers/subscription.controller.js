import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        new ApiError(400, "channelId not provided")
    }

    const user = await User.findById(channelId)
    if (!user) {
        new ApiError(404, "channel does not exist")
    }
    const subscription = await Subscription.findOne({ channel: channelId, subscriber: req.user._id })

    if (subscription) {
        await subscription.deleteOne()
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Successfully toggled subscribe on channel\'${user.username}\'`)
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        new ApiError(400, "channelId not provided")
    }

    const user = await User.findById(channelId)
    if (!user) {
        new ApiError(404, "channel does not exist")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first: "$subscriber"}
            }
        },
        {
            $project:{
                channel: 0
            }
        }
    ])

    if(!subscriber){
        throw new ApiError(404, "no subscribers found")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, subscriber, "subscribers fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params


    if (!subscriberId) {
        new ApiError(400, "subscriberId not provided")
    }

    const user = await User.findById(subscriberId)
    if (!user) {
        new ApiError(404, "user does not exist")
    }

    const channel = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline:[
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channel:{
                    $first: "$channel"
                }
            }
        },
        {
            $project:{
                subscriber: 0
            }
        }
    ])


    if(!channel?.length){
        throw new ApiError(404, "no channels found")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, channel, "channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}