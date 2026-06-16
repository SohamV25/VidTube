import mongoose from "mongoose";
import {Comment} from "../models/comment.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.models.js"
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const comments = await Comment.aggregate([
        {
            $match : {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {comments},
            "Comments fetched successfully"
        )
    )
});

const addComment = asyncHandler(async(req, res) => {
   
    const {videoId} = req.params;
    const { content } = req.body;

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const createdComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id
    });

    if(!createdComment){
        throw new ApiError(401, "Something went wrong while saving comment");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, createdComment, "Comment added successfully"
            )
        )
})

const updateComment = asyncHandler(async(req, res) => {
    const {commentContent} = req.body;
    const {commentId} = req.params;

    if(!commentContent?.trim()){
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to update the comment")
    }

    comment.content = commentContent;

    await comment.save()

    return res.status(200).json(new ApiResponse(
        200,
        comment,
        "Comment updated successfully"
    ))
})


const deleteComment = asyncHandler(async(req, res) => {
     const {commentId} = req.params;

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Your are not the owner of comment")
    }

    await Comment.findByIdAndDelete(commentId)
    

     return res
        .status(200)
        .json( new ApiResponse
            (200,
            {},
            "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}