const express = require("express");
const {
  registerCustomer,
  loginCustomer,
  forgetPassword,
  resetPassword,
} = require("../controllers/customerControllers");
const validate = require("../Middlewares/validate");
// const authenticate = require("../Middlewares/authenticate");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/register",
  [
    check("name").not().isEmpty().withMessage("Your name is required"),
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("You must type a password at least 6 chars long"),
  ],
  validate,
  registerCustomer
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("You must type a password at least 6 chars long"),
  ],
  validate,
  loginCustomer
);

router.post("/forget-password", forgetPassword);
router.get("/reset-password", resetPassword);

module.exports = router;
