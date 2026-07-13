import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

connectDB().then(
    () => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }
).catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
})

