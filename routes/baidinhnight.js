import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

// Lấy toàn bộ baidinhnight bookings
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM baidinhnight ORDER BY id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm mới booking
router.post("/", async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input("name", name)
      .input("phone", phone)
      .input("email", email)
      .input("message", message)
      .query("INSERT INTO baidinhnight (name, phone, email, message) VALUES (@name, @phone, @email, @message)");

    res.status(201).json({ success: true, message: "Booking created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật trạng thái booking
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input("id", id)
      .input("status", status)
      .query("UPDATE baidinhnight SET status = @status WHERE id = @id");

    res.json({ success: true, message: "Status updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xoá booking
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    await pool.request()
      .input("id", id)
      .query("DELETE FROM baidinhnight WHERE id = @id");

    res.json({ success: true, message: "Booking deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

