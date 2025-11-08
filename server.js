import express from "express";
import cors from "cors";
import path from "path"; 
import blogRoutes from "./routes/blog.js";
import visitRoutes from "./routes/visit.js";
import authRoutes from "./routes/auth.js";
import promotionRoutes from "./routes/promotion.js";
import contactRoutes from "./routes/restaurant.js";
import conferenceRoutes from "./routes/conference.js";
import baidinhnightRoutes from "./routes/baidinhnight.js";
import contactpageRoutes from "./routes/contactpage.js";
import recruitmentRoutes from "./routes/recruitment.js";
import ticketRoutes from "./routes/ticket.js"; 
import seeRoutes from "./routes/see.js";
import roomRoutes from "./routes/room.js"; 
import bookingRoutes from "./routes/booking.js"; 
import comboTicketRoutes from "./routes/comboTicket.js";
import bookingCarRoutes from "./routes/bookingService.js";



const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// 🖼️ Serve ảnh tĩnh
app.use("/uploads/blogs", express.static(path.join(process.cwd(), "uploads", "blogs")));
app.use("/uploads/visit", express.static(path.join(process.cwd(), "uploads", "visit")));
app.use("/uploads/promotions", express.static(path.join(process.cwd(), "uploads", "promotions")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🧭 Khai báo các route
app.use("/api/blog", blogRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/promotion", promotionRoutes);
app.use("/api/restaurant", contactRoutes);
app.use("/api/conference", conferenceRoutes);
app.use("/api/baidinhnight", baidinhnightRoutes);
app.use("/api/contactpage", contactpageRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/ticket", ticketRoutes); 
app.use("/api/room", roomRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/see", seeRoutes);
app.use("/api/bookingcar", bookingCarRoutes);
app.use("/api/combo-ticket", comboTicketRoutes);

// 🚀 Khởi động server
app.listen(4000, "0.0.0.0", () => console.log("✅ Server running on http://0.0.0.0:4000"));

