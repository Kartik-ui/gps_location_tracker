import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed: ", error);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});
