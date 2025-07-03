const asyncHandler = (requestHandle) => {
    return (req , res , next) => {
        Promise.resolve(requestHandle(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}



/* use the try and catch method to learn about more ways to write
const asyncHandler1 = (reqestHandle) => async (req , res , next) => {
    try {
          await reqestHandle(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })

    }
}
*/