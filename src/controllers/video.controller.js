import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortType = "desc", userId } = req.query
    let { sortBy } = req.query
    //TODO: get all videos based on query, sort, pagination

    const allowedSortFields = ["createdAt", "views", "duration"];

    if (!allowedSortFields.includes(sortBy)) {
        sortBy = "createdAt"
}

    const pageNum = Number(req.query.page)
    const limitNum = Number(req.query.limit)
    const skip = (pageNum - 1) * limitNum;

    const video = await Video.aggregate([
        {
            $match: {
                    isPublished: true,
                ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
                ...(query && {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                })
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
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
            $project:{
                isPublished: 0
            }
        }
    ])

    if(!video?.length){
        new ApiError(404, "Videos not found")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, video, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "All fields are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "video and thumbnail required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile = await uploadOnCloudinary(videoLocalPath)


    if (!videoFile || !thumbnail) {
        if (videoFile) { await deleteFromCloudinary(videoFile.url) }
        else if (thumbnail) { await deleteFromCloudinary(thumbnail.url) }

        throw new ApiError(500, "failed to upload video")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, video, "video uploaded succesfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!videoId.trim()) {
        throw new ApiError(400, "videoId not provided")
    }
    const video = await Video.findById(videoId)

    if (!video) {
        new ApiError(400, "video not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, video, "video fetched successfully")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path

    if (!(videoId.trim() || title.trim() || description.trim() || thumbnailLocalPath)) {
        throw new ApiError(400, "atleast 1 field is required")
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    })

    if (!video) {
        new ApiError(400, "video not found")
    }

    let thumbnail
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            new ApiError(500, "failed to upload thumbnail")
        }
        await deleteFromCloudinary(video.thumbnail)
    }

    if (title) video.title = title
    if (description) video.description = description
    if (thumbnail) video.thumbnail = thumbnail.url
    await video.save()

    res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video updated successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId.trim()) {
        throw new ApiError(400, "videoId not provided")
    }

    const video = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, `Video \'${video.title}\' deleted successfully`)
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId.trim()) {
        throw new ApiError(400, "videoId not provided")
    }
    
      const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    })

    video.isPublished = !video.isPublished
    await video.save()

    res
        .status(200)
        .json(
            new ApiResponse(200, video, `Video Publish status changed successfully`)
        )


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
