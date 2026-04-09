/*const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "asyncHandler Error"
        });
    }
};

export default asyncHandler;
*/

/*const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            res.status(error.code || 500).json({
                success: false,
                message: error.message || "asyncHandler Error"
            });
        });
    };
};
*/


const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    };
};

export default asyncHandler;


/*const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(next);
    };
};

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});
*/
