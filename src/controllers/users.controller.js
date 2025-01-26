import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/FileUploading.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token!")
    }

}


const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty string
    //check if user alredy exits : username , email
    // check of images, check for avatar
    // upload to them on cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token fiels from response
    // check for user creation
    //return res

    const { fullname, email, username, password } = req.body
    console.log('User registration', req.body, req.files)

    if ([fullname, email, username, password].some(
        (field) => { field?.trim() === "" })
    ) {
        throw new ApiError('All field are  required', 400)
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError('User already exists', 409)
    }


    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalpath = req.files?.coverImage[0]?.path;


    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    }

    if (!avatarLocalpath) {
        throw new ApiError('Avatar is required', 400)
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalpath)


    if (!avatar) {
        throw new ApiError('Error uploading avatar', 500)
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError('User not created', 500)
    }

    return res.status(201).json(
        new ApiResponse(createdUser, "User registered succesfully", true)
    )
})


const loginUser = asyncHandler(async (req, res) => {
    //req body
    //username or email
    //find the user
    //password check
    // access and refresh token
    // send cookie

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not exit")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)


    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken }),
            "User Logged In Successfully"
        )


})


const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id
        , {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, "User logged out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newRefreshToken, accessToken } = await generateAccessAndRefreshTokens(user?._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword

    user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "Current user fetched successfully")
})

const updateAccounDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details Updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalpath = req.file?.path

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, { new: true }
    ).select("-password")


    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalpath = req.file?.path

    if (!coverLocalpath) {
        throw new ApiError(400, "coverImage  file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLocalpath)

    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated Successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccounDetails,
    updateUserAvatar,
    updateUserCoverImage
};