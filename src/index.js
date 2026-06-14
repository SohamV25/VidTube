import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

//configure where the file is
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

//use the function '()'
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
  });
