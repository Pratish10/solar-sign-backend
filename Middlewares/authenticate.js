const passport = require("passport");

exports.User = (req, res, next) => {
  passport.authenticate("jwt", function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      //   console.log("Wrong Token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized access - No token provided" });
    }
    req.user = user;
    // console.log(user);
    next();
  })(req, res, next);
};
