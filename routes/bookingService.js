import express from "express";
import { getConnection } from "../config/db.js";
import sql from "mssql";

const router = express.Router();

// 📌 Thêm đơn đặt dịch vụ
router.post("/", async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      booking_date,
      dong_hanh_te,
      dong_hanh_nl,
      hanh_trinh_te,
      hanh_trinh_nl,
      cham_net_te,
      cham_net_nl,
      total_price,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!fullname || !phone || !booking_date) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email || null)
      .input("phone", sql.NVarChar, phone)
      .input("booking_date", sql.Date, booking_date)
      .input("dong_hanh_te", sql.Int, dong_hanh_te || 0)
      .input("dong_hanh_nl", sql.Int, dong_hanh_nl || 0)
      .input("hanh_trinh_te", sql.Int, hanh_trinh_te || 0)
      .input("hanh_trinh_nl", sql.Int, hanh_trinh_nl || 0)
      .input("cham_net_te", sql.Int, cham_net_te || 0)
      .input("cham_net_nl", sql.Int, cham_net_nl || 0)
      .input("total_price", sql.Decimal(18, 2), total_price || 0)
      .query(`
        INSERT INTO booking_car  
        (fullname, email, phone, booking_date,
         dong_hanh_te, dong_hanh_nl, hanh_trinh_te, hanh_trinh_nl,
         cham_net_te, cham_net_nl, total_price, status)
        VALUES 
        (@fullname, @email, @phone, @booking_date,
         @dong_hanh_te, @dong_hanh_nl, @hanh_trinh_te, @hanh_trinh_nl,
         @cham_net_te, @cham_net_nl, @total_price, 0)
      `);

    res.status(201).json({ message: "✅ Đặt dịch vụ thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm đặt dịch vụ:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
  }
});

// 📌 Lấy danh sách đơn đặt dịch vụ
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id, fullname, email, phone, booking_date,
             dong_hanh_te, dong_hanh_nl, hanh_trinh_te, hanh_trinh_nl,
             cham_net_te, cham_net_nl, total_price, status, created_at
      FROM booking_car
      ORDER BY created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách:", error);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ server." });
  }
});

// 📌 Cập nhật trạng thái đơn (0: chờ, 1: xác nhận)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.Int, status)
      .query(`
        UPDATE booking_car
        SET status = @status
        WHERE id = @id
      `);

    res.json({ message: "✅ Cập nhật trạng thái thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Không thể cập nhật trạng thái." });
  }
});

export default router;

