
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();


app.use(express.json());


app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON body. Please check your Postman request."
    });
  }

  next(err);
});


app.get("/", (req, res) => {
  res.send("Inventory Management API is running");
});


app.use("/api/products", require("./routes/productRoutes"));

app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});


async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
