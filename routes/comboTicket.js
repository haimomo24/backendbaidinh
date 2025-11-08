import express from "express";
import { getConnection } from "../config/db.js";
import sql from "mssql";

const router = express.Router();

// 📌 Thêm đặt vé Combo
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, combo_choice, visit_date, quantity, note } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !phone || !combo_choice || !visit_date || !quantity) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    const pool = await getConnection();
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("phone", sql.NVarChar, phone)
      .input("email", sql.NVarChar, email || null)
      .input("combo_choice", sql.NVarChar, combo_choice)
      .input("visit_date", sql.Date, visit_date)
      .input("quantity", sql.Int, quantity)
      .input("note", sql.NVarChar, note || null)
      .input("status", sql.Int, 0) // 🔹 Mặc định chưa xác nhận
      .query(`
        INSERT INTO combo_ticket (name, phone, email, combo_choice, visit_date, quantity, note, status)
        VALUES (@name, @phone, @email, @combo_choice, @visit_date, @quantity, @note, @status)
      `);

    res.status(201).json({ message: "Đặt vé combo thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm vé combo:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Lấy danh sách vé combo
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id, name, phone, email, combo_choice, visit_date, quantity, note, status
      FROM combo_ticket
      ORDER BY id DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách vé combo:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Cập nhật trạng thái xác nhận / huỷ
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.Int, status)
      .query(`
        UPDATE combo_ticket
        SET status = @status
        WHERE id = @id
      `);

    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Xóa vé combo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM combo_ticket WHERE id = @id`);
    res.json({ message: "Xóa vé combo thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa vé combo:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;

