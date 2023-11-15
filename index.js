const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const passport = require("passport");
require("dotenv").config();
const morgan = require("morgan");

const customerRoutes = require("./Routes/customerRoutes");

const PORT = process.env.PORT || 8000;

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(morgan("dev"));
require("./Middlewares/jwt")(passport);

connectDB();

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "You are in Auth endpoint. Register or Login to test Auth",
  });
});

// user routes
app.use("/api/customer", customerRoutes);

app.listen(PORT, console.log(`Server is listening on PORT:${PORT}`));
