import express from "express";
import multer from "multer";
import path from "path";
import { getConnection } from "../config/db.js";

const router = express.Router();

// 📁 Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // thư mục lưu file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // đổi tên file tránh trùng
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // chỉ chấp nhận file PDF hoặc Word
    const allowedTypes = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file .pdf, .doc, .docx"));
    }
  },
});

// 📌 Lấy toàn bộ danh sách ứng viên
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM recruitment ORDER BY id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Thêm mới ứng viên
router.post("/", upload.single("cv_file"), async (req, res) => {
  const { fullname, email, phone, position, message } = req.body;
  const cv_file = req.file ? req.file.filename : null; // lấy tên file

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("fullname", fullname)
      .input("email", email)
      .input("phone", phone)
      .input("position", position)
      .input("message", message)
      .input("cv_file", cv_file)
      .query(
        "INSERT INTO recruitment (fullname, email, phone, position, message, cv_file) VALUES (@fullname, @email, @phone, @position, @message, @cv_file)"
      );

    res
      .status(201)
      .json({ success: true, message: "Ứng viên đã được thêm thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Cập nhật ghi chú hoặc trạng thái
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", id)
      .input("message", message)
      .query("UPDATE recruitment SET message = @message WHERE id = @id");

    res.json({ success: true, message: "Đã cập nhật thông tin ứng viên!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Xóa ứng viên
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    await pool.request().input("id", id).query("DELETE FROM recruitment WHERE id = @id");

    res.json({ success: true, message: "Đã xóa ứng viên thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

