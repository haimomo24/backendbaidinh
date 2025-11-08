import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

/* 🟢 Thêm đơn đặt phòng */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, roomType } = req.body;

    if (!name || !email || !phone || !roomType) {
      return res.status(400).json({ error: "Thiếu thông tin đặt phòng" });
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("name", name)
      .input("email", email)
      .input("phone", phone)
      .input("roomType", roomType)
      .query(`
        INSERT INTO bookings (name, email, phone, roomType)
        VALUES (@name, @email, @phone, @roomType)
      `);

    res.status(201).json({ message: "Đặt phòng thành công!" });
  } catch (err) {
    console.error("❌ Lỗi thêm đặt phòng:", err);
    res.status(500).json({ error: "Lỗi server khi thêm đặt phòng" });
  }
});

/* 🟢 Lấy danh sách tất cả đơn đặt phòng */
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT * FROM bookings ORDER BY id ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách đặt phòng:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách" });
  }
});

/* 🟢 Cập nhật trạng thái đơn đặt phòng */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("id", id)
      .input("status", status)
      .query(`
        UPDATE bookings
        SET status = @status
        WHERE id = @id
      `);

    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật" });
  }
});

export default router;

