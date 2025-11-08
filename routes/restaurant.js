import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

// API thêm contact booking
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const pool = await getConnection();
    await pool.request()
      .input("name", name)
      .input("phone", phone)
      .input("email", email)
      .input("message", message || "")
      .query(`
        INSERT INTO contact_booking (name, phone, email, message)
        VALUES (@name, @phone, @email, @message)
      `);

    res.status(201).json({ message: "Đặt bàn thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm contact:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// API lấy toàn bộ contact booking (chỉnh timezone về VN)
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        id, 
        name, 
        phone, 
        email, 
        message, 
        status,
        created_at
      FROM contact_booking
      ORDER BY created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Lỗi khi lấy contact:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// API cập nhật trạng thái
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 0 hoặc 1

    const pool = await getConnection();
    await pool.request()
      .input("id", id)
      .input("status", status)
      .query(`
        UPDATE contact_booking 
        SET status = @status 
        WHERE id = @id
      `);

    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;

