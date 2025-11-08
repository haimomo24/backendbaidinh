import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getConnection } from "../config/db.js";

const router = express.Router();

// 🧩 Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "blogs");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🟢 POST: Thêm blog
router.post(
  "/",
  upload.fields([
    { name: "images_1" },
    { name: "images_2" },
    { name: "images_3" },
    { name: "images_4" },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        title_1,
        title_2,
        title_3,
        title_4,
        title_5,
        name_en,
        title_1_en,
        title_2_en,
        title_3_en,
        title_4_en,
        title_5_en,
      } = req.body;

      if (!name) return res.status(400).json({ error: "Thiếu name" });

      const images_1 = req.files["images_1"] ? req.files["images_1"][0].filename : null;
      const images_2 = req.files["images_2"] ? req.files["images_2"][0].filename : null;
      const images_3 = req.files["images_3"] ? req.files["images_3"][0].filename : null;
      const images_4 = req.files["images_4"] ? req.files["images_4"][0].filename : null;

      const pool = await getConnection();
      await pool
        .request()
        .input("name", name)
        .input("images_1", images_1)
        .input("images_2", images_2)
        .input("images_3", images_3)
        .input("images_4", images_4)
        .input("title_1", title_1 || null)
        .input("title_2", title_2 || null)
        .input("title_3", title_3 || null)
        .input("title_4", title_4 || null)
        .input("title_5", title_5 || null)
        .input("name_en", name_en || null)
        .input("title_1_en", title_1_en || null)
        .input("title_2_en", title_2_en || null)
        .input("title_3_en", title_3_en || null)
        .input("title_4_en", title_4_en || null)
        .input("title_5_en", title_5_en || null)
        .query(`
          INSERT INTO blog 
          (name, images_1, images_2, images_3, images_4, 
           title_1, title_2, title_3, title_4, title_5, 
           name_en, title_1_en, title_2_en, title_3_en, title_4_en, title_5_en)
          VALUES 
          (@name, @images_1, @images_2, @images_3, @images_4,
           @title_1, @title_2, @title_3, @title_4, @title_5,
           @name_en, @title_1_en, @title_2_en, @title_3_en, @title_4_en, @title_5_en)
        `);

      res.status(201).json({ message: "Thêm blog thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server khi thêm blog!" });
    }
  }
);

// 🟡 GET: Lấy danh sách blog
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM blog ORDER BY id DESC");

    const blogs = result.recordset.map((item) => ({
      ...item,
      images_1: item.images_1 ? `${req.protocol}://${req.get("host")}/uploads/blogs/${item.images_1}` : null,
      images_2: item.images_2 ? `${req.protocol}://${req.get("host")}/uploads/blogs/${item.images_2}` : null,
      images_3: item.images_3 ? `${req.protocol}://${req.get("host")}/uploads/blogs/${item.images_3}` : null,
      images_4: item.images_4 ? `${req.protocol}://${req.get("host")}/uploads/blogs/${item.images_4}` : null,
    }));

    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server khi lấy dữ liệu!" });
  }
});

// 🟡 GET: Lấy blog theo ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request().input("id", id).query("SELECT * FROM blog WHERE id = @id");

    if (result.recordset.length === 0) return res.status(404).json({ error: "Blog không tồn tại" });

    const blog = result.recordset[0];
    ["images_1", "images_2", "images_3", "images_4"].forEach((img) => {
      blog[img] = blog[img] ? `${req.protocol}://${req.get("host")}/uploads/blogs/${blog[img]}` : null;
    });

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server khi lấy blog!" });
  }
});

// 🔴 DELETE: Xóa blog + ảnh
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", id)
      .query("SELECT images_1, images_2, images_3, images_4 FROM blog WHERE id = @id");

    if (result.recordset.length === 0) return res.status(404).json({ error: "Blog không tồn tại" });

    const blog = result.recordset[0];
    const deleteImage = (filename) => {
      if (filename) {
        const filePath = path.join(process.cwd(), "uploads", "blogs", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    };

    deleteImage(blog.images_1);
    deleteImage(blog.images_2);
    deleteImage(blog.images_3);
    deleteImage(blog.images_4);

    await pool.request().input("id", id).query("DELETE FROM blog WHERE id = @id");

    res.json({ message: "Xoá blog thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server khi xoá blog!" });
  }
});

// 🟠 PUT: Cập nhật blog
router.put(
  "/:id",
  upload.fields([
    { name: "images_1" },
    { name: "images_2" },
    { name: "images_3" },
    { name: "images_4" },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        title_1,
        title_2,
        title_3,
        title_4,
        title_5,
        name_en,
        title_1_en,
        title_2_en,
        title_3_en,
        title_4_en,
        title_5_en,
      } = req.body;

      if (!name) return res.status(400).json({ error: "Thiếu name" });

      const pool = await getConnection();
      const oldResult = await pool
        .request()
        .input("id", id)
        .query("SELECT images_1, images_2, images_3, images_4 FROM blog WHERE id = @id");

      if (oldResult.recordset.length === 0) return res.status(404).json({ error: "Blog không tồn tại" });

      const oldBlog = oldResult.recordset[0];
      const getFile = (field) => (req.files[field] ? req.files[field][0].filename : oldBlog[field]);

      const images_1 = getFile("images_1");
      const images_2 = getFile("images_2");
      const images_3 = getFile("images_3");
      const images_4 = getFile("images_4");

      const deleteOldImage = (oldFile, newFile) => {
        if (oldFile && newFile && oldFile !== newFile) {
          const filePath = path.join(process.cwd(), "uploads", "blogs", oldFile);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      };
      deleteOldImage(oldBlog.images_1, images_1);
      deleteOldImage(oldBlog.images_2, images_2);
      deleteOldImage(oldBlog.images_3, images_3);
      deleteOldImage(oldBlog.images_4, images_4);

      await pool
        .request()
        .input("id", id)
        .input("name", name)
        .input("images_1", images_1)
        .input("images_2", images_2)
        .input("images_3", images_3)
        .input("images_4", images_4)
        .input("title_1", title_1 || null)
        .input("title_2", title_2 || null)
        .input("title_3", title_3 || null)
        .input("title_4", title_4 || null)
        .input("title_5", title_5 || null)
        .input("name_en", name_en || null)
        .input("title_1_en", title_1_en || null)
        .input("title_2_en", title_2_en || null)
        .input("title_3_en", title_3_en || null)
        .input("title_4_en", title_4_en || null)
        .input("title_5_en", title_5_en || null)
        .query(`
          UPDATE blog SET 
            name = @name,
            images_1 = @images_1,
            images_2 = @images_2,
            images_3 = @images_3,
            images_4 = @images_4,
            title_1 = @title_1,
            title_2 = @title_2,
            title_3 = @title_3,
            title_4 = @title_4,
            title_5 = @title_5,
            name_en = @name_en,
            title_1_en = @title_1_en,
            title_2_en = @title_2_en,
            title_3_en = @title_3_en,
            title_4_en = @title_4_en,
            title_5_en = @title_5_en
          WHERE id = @id
        `);

      const updated = await pool.request().input("id", id).query("SELECT * FROM blog WHERE id = @id");
      const blog = updated.recordset[0];
      ["images_1", "images_2", "images_3", "images_4"].forEach((img) => {
        blog[img] = blog[img] ? `${req.protocol}://${req.get("host")}/uploads/blogs/${blog[img]}` : null;
      });

      res.json({ message: "Cập nhật blog thành công!", blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server khi cập nhật blog!" });
    }
  }
);

export default router;

