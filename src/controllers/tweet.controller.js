import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiResponse(400, "content not provided")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "tweet posted successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "userId not provided")
    }

    const tweet = await Tweet.find({
        owner: userId
    }).select("-owner")

    if (!tweet.length) {
        throw new ApiError(404, "no tweets found by this user")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "tweets fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    const { content } = req.body

    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "you can't post an empty tweet")
    }

    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId,
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
            new ApiResponse(200, tweet, "Tweet updated succesfully")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }

    await Tweet.findOneAndDelete({
         _id: tweetId,
          owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, "tweet deleted successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
