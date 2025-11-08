import express from "express";
import multer from "multer";
import path from "path";
import { getConnection } from "../config/db.js";

const router = express.Router();

// ================= Cấu hình lưu file ảnh =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Tên ảnh ngẫu nhiên
  },
});

const upload = multer({ storage });

// ==========================================================
// 📌 1️⃣ POST - Thêm phòng
// ==========================================================
router.post(
  "/",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { room_name, total_rooms, price } = req.body;

      if (!room_name || !total_rooms || !price) {
        return res.status(400).json({ error: "Thiếu dữ liệu phòng" });
      }

      const image1 = req.files["image1"]
        ? `/uploads/${req.files["image1"][0].filename}`
        : null;
      const image2 = req.files["image2"]
        ? `/uploads/${req.files["image2"][0].filename}`
        : null;
      const image3 = req.files["image3"]
        ? `/uploads/${req.files["image3"][0].filename}`
        : null;
      const image4 = req.files["image4"]
        ? `/uploads/${req.files["image4"][0].filename}`
        : null;

      const pool = await getConnection();
      await pool
        .request()
        .input("room_name", room_name)
        .input("total_rooms", total_rooms)
        .input("price", price)
        .input("image1", image1)
        .input("image2", image2)
        .input("image3", image3)
        .input("image4", image4)
        .query(`
          INSERT INTO rooms (room_name, total_rooms, price, image1, image2, image3, image4)
          VALUES (@room_name, @total_rooms, @price, @image1, @image2, @image3, @image4)
        `);

      res.status(201).json({ message: "✅ Thêm phòng thành công!" });
    } catch (err) {
      console.error("❌ Lỗi khi thêm phòng:", err);
      res.status(500).json({ error: "Lỗi server khi thêm phòng" });
    }
  }
);

// ==========================================================
// 📌 2️⃣ GET - Lấy danh sách phòng
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM rooms ORDER BY id ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách phòng:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách phòng" });
  }
});

// ==========================================================
// 📌 3️⃣ GET - Lấy chi tiết 1 phòng
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", id)
      .query("SELECT * FROM rooms WHERE id = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết phòng:", err);
    res.status(500).json({ error: "Lỗi server khi lấy chi tiết phòng" });
  }
});

// ==========================================================
// 📌 4️⃣ PUT - Cập nhật phòng
// ==========================================================
router.put(
  "/:id",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { room_name, total_rooms, price } = req.body;

      const image1 = req.files["image1"]
        ? `/uploads/${req.files["image1"][0].filename}`
        : req.body.old_image1 || null;
      const image2 = req.files["image2"]
        ? `/uploads/${req.files["image2"][0].filename}`
        : req.body.old_image2 || null;
      const image3 = req.files["image3"]
        ? `/uploads/${req.files["image3"][0].filename}`
        : req.body.old_image3 || null;
      const image4 = req.files["image4"]
        ? `/uploads/${req.files["image4"][0].filename}`
        : req.body.old_image4 || null;

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("id", id)
        .input("room_name", room_name)
        .input("total_rooms", total_rooms)
        .input("price", price)
        .input("image1", image1)
        .input("image2", image2)
        .input("image3", image3)
        .input("image4", image4)
        .query(`
          UPDATE rooms
          SET room_name = @room_name,
              total_rooms = @total_rooms,
              price = @price,
              image1 = @image1,
              image2 = @image2,
              image3 = @image3,
              image4 = @image4
          WHERE id = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Không tìm thấy phòng để sửa" });
      }

      res.json({ message: "✅ Cập nhật phòng thành công!" });
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật phòng:", err);
      res.status(500).json({ error: "Lỗi server khi cập nhật phòng" });
    }
  }
);

// ==========================================================
// 📌 5️⃣ DELETE - Xoá phòng
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", id)
      .query("DELETE FROM rooms WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng để xoá" });
    }

    res.json({ message: "🗑️ Xoá phòng thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi xoá phòng:", err);
    res.status(500).json({ error: "Lỗi server khi xoá phòng" });
  }
});

export default router;

