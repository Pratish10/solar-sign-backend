const asyncHandler = require("express-async-handler");
const Customer = require("../Models/customerSchema");
const generateToken = require("../Middlewares/generateToken");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");

const registerCustomer = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const customerExists = await Customer.findOne({ email });
    if (customerExists)
      return res
        .status(401)
        .json({ message: "Error! User already registered" });

    const customer = await Customer.create({
      name,
      email,
      password,
    });

    if (customer) {
      res.status(200).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        token: generateToken(customer._id),
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
    console.log("Error creating customer", error.message);
  }
});

const loginCustomer = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer)
      return res.status(401).json({
        message: "Customer does not exists",
      });

    const isPasswordMatch = await customer.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email/password",
      });
    }

    res.status(200).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      token: generateToken(customer._id),
    });
  } catch (error) {
    res.status(400).json(error.message);
    console.log("Error loging customer:", error.message);
  }
});

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_MAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_MAIL,
      to: email,
      subject: "For Reset Password",
      html: `Hi ${name}, Please go through the <a href="http://localhost:8000/api/customer/reset-password?token=${token}">link</a> to reset your password!`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Mail has been sent", info.response);
      }
    });
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const forgetPassword = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const customer = await Customer.findOne({ email });
    if (customer) {
      const randomString = randomstring.generate();
      const data = await Customer.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(customer.name, customer.email, randomString);
      res
        .status(200)
        .json({ message: "Reset Link has been sent to your mail" });
    } else {
      res.status(400).json({ message: "This email doesnot exists" });
    }
  } catch (error) {
    res.status(400).json(error.message);
    console.log("error", error.message);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await Customer.findOne({ token });
    if (tokenData) {
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      const customerData = await Customer.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: hashedPassword, token: "" } },
        { new: true }
      );
      res.status(200).json({ message: "Customer password has been reset" });
    } else {
      res.status(400).json({ message: "This link is expired" });
    }
  } catch (error) {
    res.status(400).json(error.message);
    console.log("error", error.message);
  }
});

module.exports = {
  registerCustomer,
  loginCustomer,
  forgetPassword,
  resetPassword,
};
