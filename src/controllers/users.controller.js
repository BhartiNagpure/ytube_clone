import asyncHandler from '../utils/asyncHandler.js'


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'User registration'
    })
    console.log('User registration')
})


export default registerUser;