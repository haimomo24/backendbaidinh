import express from "express";
import { getConnection } from "../config/db.js";
import sql from "mssql";

const router = express.Router();

// 📌 Thêm đặt vé
router.post("/", async (req, res) => {
  try {
    const { fullname, phone, email, ticket_option, visit_date, people_count, message } = req.body;

    if (!fullname || !phone || !ticket_option || !visit_date || !people_count) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    const pool = await getConnection();
    await pool.request()
      .input("fullname", sql.NVarChar, fullname)
      .input("phone", sql.NVarChar, phone)
      .input("email", sql.NVarChar, email || null)
      .input("ticket_option", sql.NVarChar, ticket_option)
      .input("visit_date", sql.Date, visit_date)
      .input("people_count", sql.Int, people_count)
      .input("message", sql.NVarChar, message || null)
      .query(`
        INSERT INTO hanhtrinhdisan (fullname, phone, email, ticket_option, visit_date, people_count, message, status)
        VALUES (@fullname, @phone, @email, @ticket_option, @visit_date, @people_count, @message, 0)
      `);

    res.status(201).json({ message: "Đặt vé thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm đặt vé:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Lấy danh sách đặt vé
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id, fullname, phone, email, ticket_option, visit_date, people_count, message, status, created_at
      FROM hanhtrinhdisan
      ORDER BY created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Cập nhật trạng thái xác nhận
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.Int, status)
      .query(`
        UPDATE hanhtrinhdisan
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

