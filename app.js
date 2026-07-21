import express from "express";
import cors from "cors";
import routes from './src/routes/index.js'

const app = express();

// Allowed origins for CORS
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://expense-tracker-frontend.vercel.app",
//   "https://expense-tracker-frontend.onrender.com",
// ];

app.use(express.json());
app.use(express.urlencoded({ extended: true }))



app.use((cors()));

// app.use(cors({
//   origin: function(origin, callback) {
//     if(!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   }
// }));



app.get("/", (req, res) => {
  res.json({success: true, message: "Welcome to Expense Tracker API"});
});
app.use(`/api/v1`, routes);
// app.use(`${process.env.API_PREFIX}/auth`, authRoutes);

export default app;