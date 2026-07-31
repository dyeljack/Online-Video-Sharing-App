import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!(name?.trim() && description?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "userId not provided")
    }

    const playlist = await Playlist.find({
        owner: userId
    })

    if (!playlist) {
        throw new ApiError(404, "no playlists found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "user playlists fetched successfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "playlistId not provided")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(playlistId.trim() && videoId.trim())) {
        throw new ApiError(400, "All fields are required")
    }
    const video = Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "invalid videoId")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video added to playlist successfully")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(playlistId.trim() && videoId.trim())) {
        throw new ApiError(400, "All fields are required")
    }
    const video = Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "invalid videoId")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        }, {
        $pull: {
            videos: videoId
        }
    },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video removed from playlist successfully")
        )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId.trim()) {
        throw new ApiError(400, "All fields are required")
    }

    await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, "playlist deleted successfully")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId?.trim() || (!name?.trim() && !description?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

      const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        }, {
            $set: {
                name,
                description
            }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist updated successfully")
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
