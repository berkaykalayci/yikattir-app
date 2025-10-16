import express from "express";
import cors from "cors";
import businessRoutes from "./routes/businessRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

// rotalar
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);

app.listen(5000, () => console.log("Server 5000 portunda çalışıyor 🚀"));
