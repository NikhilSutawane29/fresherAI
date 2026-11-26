
// in Gateway we find our current user
export const getCurrentUser = async (req, res) => {
    try {
        // we cannot find current user through it's model, but :-
        // we find current user from session -> which we created in redis and we get in isAuth middleware in "req.user"(req.user conatins all session data)
        return res.status(200).json({success: true, user: req.user})

    } catch (error) {
        return res.status(200).json({success: false, message: error.message})
    }
}